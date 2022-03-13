import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    size : (RestClient, Graphql)=>{
        let width = ()=>{
            return new Promise(async (resolve, reject)=>{
                let rs = await Graphql.query({data: `
                    mutation  MetafieldDefinitionCreateMutation  ($input: MetafieldDefinitionInput!) {
                        metafieldDefinitionCreate(definition: $input) {
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `}, { variables : {
                        "input": {
                            "ownerType": "PRODUCT",
                            "namespace": "dimensiones",
                            "key": "ancho",
                            "type": "number_integer",
                            "value" : "0",
                            "name": "ancho",
                            "description": "Defina en (cms) la anchura del paquete",
                            "pin" : true
                        }
                }}).catch((e)=>console.log(e));
                console.log("rs", JSON.stringify(rs.body.errors));
                
                resolve(rs);
            });
        };
      
        return Promise.all([width()]);
    }
 }

 export default MetafieldController