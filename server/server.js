import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import mongoose from 'mongoose';
import Settings from '../models/Settings';
import OrderController from '../controllers/OrderController'
import Queue from  'better-queue';
import { storeCallback, loadCallback, deleteCallback } from '../helpers/session.helper';

dotenv.config();

// const port = parseInt(process.env.PORT, 10) || 3000;
const port = process.env.NODE_ENV == 'production' ? process.env.PORT : 3000;
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
  API_VERSION:'2022-01',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE:new Shopify.Session.CustomSessionStorage(storeCallback, loadCallback, deleteCallback),
});


const ACTIVE_SHOPIFY_SHOPS = {};

let order_queue = new Queue(async (ctx, cb) => {
    console.log("ctx.request.body.gateway", ctx.request.body);
    if(ctx.request.body.gateway == 'Cash on Delivery (COD)'){
        let host = new URL(ctx.request.body.order_status_url).host;
        let auth = await Settings.findOne({ domain :  host});

        console.log("auth", auth);
        console.log("auth", auth);

        if(auth.webhook){
            let order = await OrderController.createOrder(ctx.request.body, auth).catch((e)=>console.log(e));
            cb(null, order);
            console.log(`Order Processed`);
        }
    }
})

app.prepare().then(async () => {
  const environment = process.env.NODE_ENV == 'development' ? process.env.MONGODB_CONNECTION_STRING_DEV : process.env.MONGODB_CONNECTION_STRING_PRO;
  await mongoose.connect(environment).catch((e)=>console.log(`Error connecting database : ${e.message}`));

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

  apiRoutes.get('/api/settings/me/:domain', async (ctx)=>{
    let s = await Settings.findOne({ domain : ctx.request.params.domain });
    ctx.response.status = 200;
    ctx.response.body = s || [];
  });

  apiRoutes.post('/api/settings', async (ctx)=>{
    const s = new Settings(ctx.request.body);
    await s.save();
    ctx.response.status = 200;
    ctx.response.body = s
  });

  apiRoutes.put('/api/settings/status/:id', async (ctx)=>{
    let s = await Settings.updateOne({ _id : ctx.params.id}, {...ctx.request.body});
    let r = await Settings.findOne({ id :  ctx.params.id});
    ctx.response.status = 200;
    ctx.response.body = r;
  });

  apiRoutes.post('/api/shippings', async (ctx)=>{
    console.log("company",  ctx.request.body.rate);
    let auth = await Settings.findOne({ shop :  ctx.request.body.rate.origin.company_name});

    console.log("auth", auth)

    if(auth && auth.carrier){
        let rates = await OrderController.getShippingRates(ctx.request.body.rate, auth).catch((e)=>console.log(e));
        ctx.body = { rates :  OrderController.mapCarrier(rates.courriers)}
        ctx.status = 200;
    }
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
            path: '/webhook-notification',
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

        ctx.redirect(`/?shop=${shop}&host=${host}`);

      },
    })
  );

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post('/webhook-notification', async (ctx)=>{
    order_queue.push(ctx)
    ctx.response.status = 201;
    ctx.response.body  = {};
  });

  router.put("/carrier-service/:id", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const data = await client.put({
        path: `carrier_services/${ctx.request.params.id}`,
        data: ctx.request.body,
        type: DataType.JSON,
    });

    ctx.status = 200;
    ctx.body = {
      status: "OK_CARRIERS_UPDATED",
      data: data,
    };

  });

  router.post("/carrier-service", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const carrier = await client.post({
      path: 'carrier_services',
      data: ctx.request.body,
      type: DataType.JSON,
    }).catch((e)=>console.log(e.message));

    ctx.body = {
      status: "OK_CARRIERS",
      data: carrier,
    };

    ctx.status = 200;
  });



  router.get('/carriers-service', async (ctx)=>{
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const data = await client.get({
      path: 'carrier_services'
    });

    ctx.body = data.body
  });

  router.delete("/carrier-service", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const data = await client.delete({
      path: `carrier_services/${ctx.body.id}`,
    });

    ctx.body = {
      status: "DELETE_CARRIER",
      data: data,
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

  router.get("/", (ctx) => {
    ctx.body = {
      ok: true,
    };

    ctx.status = 200;
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
