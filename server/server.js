import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  const koaBody = require('koa-body');
  const fs = require('fs');
  const path = require('path');
  const jwt = require('jsonwebtoken');
  const apiRoutes = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  const cors = require('@koa/cors');
  server.use(cors());
  server.use(koaBody());

  apiRoutes.post('/api/webhook-notification', async (ctx)=>{
      ctx.response.status = 200;
      ctx.request.body
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
  });

  apiRoutes.post('/api/cotizador', async (ctx)=>{
    ctx.request.body = { "rates": [ { "service_name": "canadapost-overnight", "service_code": "ON", "total_price": "1295", "description": "This is the fastest option by far", "currency": "CAD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" }, { "service_name": "fedex-2dayground", "service_code": "2D", "total_price": "2934", "currency": "USD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" }, { "service_name": "fedex-priorityovernight", "service_code": "1D", "total_price": "3587", "currency": "USD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" } ] }
  });

  apiRoutes.post('/api/verify', async (ctx)=>{
    let redirectUrl = ctx.request.body.redirectUrl;

    if(!redirectUrl){
      ctx.response.status = 400;
      return ctx.response.body = "Missing redirectUrl parameter in the body";
    }

    const publicKey = fs.readFileSync(`${path.normalize(process.cwd() + '/keys/rocketfy.pem')}`, "utf8");
    
    const iss = "Rocketfy";
    const sub = "hola@rocketfy.co";
    const aud = "https://www.rocketfy.co/";
    const exp = "30m";

    const verifyOption = {  issuer: iss,  subject: sub,  audience: aud,  maxAge: exp,  algorithm: "RS256"}
    
    try {
     
      const { url } = jwt.verify(redirectUrl, publicKey, verifyOption);
      ctx.response.status = 200;
      ctx.response.body = {
        application : url
      };

    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = error;
    }

  });

  server.use(apiRoutes.routes());
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
            console.log(
              `Failed to register APP_UNINSTALLED webhook: ${response.result}`
            );
        }

        const ordersWebhooks = await Shopify.Webhooks.Registry.register({
            shop,
            accessToken,
            path: '/api/webhook-notification',
            topic: 'ORDERS_CREATE',
            webhookHandler: async (_topic, shop, body) => {
            console.log('received order create webhook: ');
            console.log(body);
          },
        });

        if (ordersWebhooks.success) {
          console.log('Successfully registered order create webhook!');
        } else {
          console.log('Failed to register order update create', ordersWebhooks.result);
        }

        ctx.redirect(`/?shop=${shop}&host=${host}&at=${accessToken}`);

      },
    })
  );

  router.post("/webhooks", async (ctx) => {
    try {
      //Process webhook
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post("/create-carrier-service", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const carrier = await client.post({
    	path: 'carrier_services',
      data: ctx.body,
      type: DataType.JSON,
    });

    ctx.body = {
      status: "OK_CARRIERS",
      data: carrier,
    };
    
    ctx.status = 200;
  });

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
