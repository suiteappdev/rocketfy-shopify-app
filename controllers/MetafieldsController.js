import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    createDimensionMetafields : (client)=>{
        let createWidth = new Promise(async (resolve, reject)=>{
            const data = await client.post({
                path: 'metafields',
                data: {"metafield":{"ownerType" : "PRODUCT" ,"namespace":"dimensiones","key":"Ancho","value":0,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            console.log("Ancho", data);
            
            resolve(data);
        });

        let createheight = new Promise( async (resolve, reject)=>{
            const data = await client.post({
                path: 'metafields',
                data: {"metafield":{"ownerType" : "PRODUCT","namespace":"dimensiones","key":"Alto","value":0,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            console.log("Alto", data);
            
            resolve(data);
        });

        let createLarge = new Promise(async (resolve, reject)=>{
            const data = await client.post({
                path: 'metafields',
                data: {"metafield":{"ownerType" : "PRODUCT", "namespace":"dimensiones","key":"Largo","value":0,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            console.log("Largo", data);
            
            resolve(data);
        });

        return Promise.all([createWidth, createLarge, createheight]);
    }
 }

 export default MetafieldController