import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    createDimensionMetafields : (RestClient, Graphql)=>{
        let createWidth = new Promise(async (resolve, reject)=>{
            const data = await RestClient.post({
                path: 'metafields',
                data: {"metafield":{"owner" : "PRODUCT", "ownerType" : "PRODUCT", "namespace":"inventory","validations": [], "visibleToStorefrontApi" : false, "pin": true, "key":"warehouse","value":25,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            /*await Graphql.query({ data: `
                mutation ($input: MetafieldStorefrontVisibilityInput!) {
                    metafieldStorefrontVisibilityCreate(input: $input) {
                        metafieldStorefrontVisibility {
                            id
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
            `}, { variables : {
                input: {
                    "namespace": "custom_fields",
                    "key": "suits",
                    "ownerType": "PRODUCT"
                }
            }});*/

            console.log("Ancho", data);
            
            resolve(data);
        });

        /*let createheight = new Promise( async (resolve, reject)=>{
            const data = await client.post({
                path: 'metafields',
                data: {"metafield":{"ownerType" : "PRODUCT","namespace":"dimensiones","key":"Alto","value":0,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            resolve(data);
        });

        let createLarge = new Promise(async (resolve, reject)=>{
            const data = await client.post({
                path: 'metafields',
                data: {"metafield":{"ownerType" : "PRODUCT", "namespace":"dimensiones","key":"Largo","value":0,"type":"number_integer"}},
                type: DataType.JSON,
            }).catch((e)=>reject(e));

            resolve(data);
        });*/

        return Promise.all([createWidth]);
    }
 }

 export default MetafieldController