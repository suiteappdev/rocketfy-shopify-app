import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    size : (RestClient, Graphql)=>{
        let width = ()=>{
            return new Promise(async (resolve, reject)=>{
                let rs = await Graphql.query({data: `
                    mutation  MetafieldDefinitionCreateMutation  ($definition: MetafieldDefinitionInput!) {
                        metafieldDefinitionCreate(definition: $definition) {
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `}, { variables : {
                        "definition": {
                            "name": "ancho",
                            "ownerType": "PRODUCT",
                            "namespace": "dimensiones",
                            "key": "ancho",
                            "type": "number_integer",
                            "description" : "Prueba",
                            "pin"  :true
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