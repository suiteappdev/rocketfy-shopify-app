import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    size : (RestClient, Graphql)=>{
        let width = ()=>{
            return new Promise(async (resolve, reject)=>{
                let rs = await Graphql.query({
                    data : {
                        "query" : `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
                            metafieldDefinitionCreate(definition: $definition) {
                                createdDefinition {
                                    id
                                    name
                                }
                                userErrors {
                                    field
                                    message
                                    code
                                }
                            }
                        }`,
                        "variables": {
                            "definition": {
                              "name": "ancho",
                              "namespace": "dimensiones",
                              "pin" : true,
                              "key": "ancho",
                              "description": "defina la anchura de su producto",
                              "type": "number_integer",
                              "ownerType": "PRODUCT"
                            }
                        },
                    }
                }).catch((e)=>console.log(e));
                console.log("rs", JSON.stringify(rs.body.errors));
                
                resolve(rs);
            });
        };
      
        return Promise.all([width()]);
    }
 }

 export default MetafieldController