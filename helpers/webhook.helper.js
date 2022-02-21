import { getSessionToken } from "@shopify/app-bridge-utils";
import Shopify, { DataType } from '@shopify/shopify-api';

const createWebhook = (shop)=>{
    return new Promise((resolve, reject)=>{
        let token = await getSessionToken();
        const client = new Shopify.Clients.Rest(shop, token);

        const data = await client.get({
            path: 'products',
        }).catch((e)=>reject(e));

        resolve(data);
    }); 
} 


export { createWebhook}