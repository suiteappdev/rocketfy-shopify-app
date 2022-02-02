import Shopify, { DataType } from '@shopify/shopify-api';
const client = new Shopify.Clients.Rest(`${process.env.shop}`, 'access_token here');

console.log(process.env);

const createCarrier = () =>{
    return new Promise((resolve, reject)=>{
        const data = await client.put({
            path: 'carrier_services/1036894957',
            data: {"carrier_service":{"id":1036894957,"name":"Some new name","active":false}},
            type: DataType.JSON,
          }).catch(reject);
    });
}

export default {createCarrier}