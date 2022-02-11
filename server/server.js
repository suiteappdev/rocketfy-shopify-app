import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router, { url } from "koa-router";
import mongoose from 'mongoose';
import Settings from '../models/Settings';
import { createOrder } from '../controllers/OrderController'

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
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const ACTIVE_SHOPIFY_SHOPS = {};

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
    let order = ctx.request.body;
    ctx.body = { "rates": [ { "service_name": "canadapost-overnight", "service_code": "ON", "total_price": "1295", "description": "This is the fastest option by far", "currency": "CAD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" }, { "service_name": "fedex-2dayground", "service_code": "2D", "total_price": "2934", "currency": "USD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" }, { "service_name": "fedex-priorityovernight", "service_code": "1D", "total_price": "3587", "currency": "USD", "min_delivery_date": "2013-04-12 14:48:45 -0400", "max_delivery_date": "2013-04-12 14:48:45 -0400" } ] }
    ctx.status = 200;
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
    let host = new URL(ctx.request.body.order_status_url).host;
    console.log("host", host);
    let r = await Settings.findOne({ domain :  host});

    console.log("r", r);

    let order = {
        "id" : ctx.request.body.name,
        "customerID":r.customerID,
        "currency": ctx.request.body.current_total_price_set.shop_money.currency_code,
        "shipping_total": 10000,
        "subtotal": parseInt(ctx.request.body.current_subtotal_price_set.shop_money.amount),
        "total": parseInt(ctx.request.body.current_total_price_set.shop_money.amount),
        "payment_method": "cod",
        "dimensions" : {
          width : 0, height : 0 , weight : 2, large : 0
        },
        "shipping" : ctx.request.body.shipping_address,
        "billing": {
          "first_name":ctx.request.body.billing_address.first_name,
          "last_name": ctx.request.body.billing_address.last_name,
          "company": "",
          "address_1":  ctx.request.body.billing_address.address1,
          "address_2":  ctx.request.body.billing_address.address2,
          "city":  ctx.request.body.billing_address.city,
          "state": ctx.request.body.billing_address.state,
          "country": ctx.request.body.billing_address.country_code,
          "email": ctx.request.body.customer.email,
          "phone": ctx.request.body.customer.phone || '0'
        },
        "line_items": ctx.request.body.line_items.map((item)=>{
            return {
                "name": item.name,
                "variation_name": item.title,
                "quantity": item.quantity,
                "total": (parseInt(item.price) * item.quantity),
                "price": parseInt(item.price),
                "width": 0,
                "height": 0,
                "large":0,
                "weight": parseInt(item.grams / 1000)
            }
        })
    }

    console.log("order", order);

    ctx.response.status = 200;
    ctx.response.body  =  response.data;
    console.log(`Webhook processed, returned status code 200`, y);
  });

  router.post("/carrier-service", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    if (session === undefined || ACTIVE_SHOPIFY_SHOPS[session.shop] === undefined) {
        ctx.redirect(`/auth?shop=${session.shop}`);
      return;
    }
    
    let carrier_data = { carrier_service: { name:"Rocketfy", callback_url:"https:\/\/rocketfy-shopify-app.herokuapp.com\/api\/cotizador", service_discovery:true }}

    const carrier = await client.post({
      path: 'carrier_services',
      data: carrier_data,
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

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
