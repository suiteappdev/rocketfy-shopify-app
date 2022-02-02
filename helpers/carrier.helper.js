import Shopify, { DataType } from '@shopify/shopify-api';
import { useLocation } from "react-router-dom";

const createCarrier = () =>{
    return new Promise(async (resolve, reject)=>{
        const search = useLocation().search;
        const at = new URLSearchParams(search).get('at');
        const client = new Shopify.Clients.Rest(`${process.env.shop}`, at);

        const data = await client.put({
            path: 'carrier_services',
            data: {"carrier_service":{"name":"Shipping Rate Provider","callback_url":"http:\/\/shippingrateprovider.com","service_discovery":true}},
            type: DataType.JSON,
        }).catch((e)=>reject(e));
        
        resolve(data);
    });
}

export default {createCarrier}