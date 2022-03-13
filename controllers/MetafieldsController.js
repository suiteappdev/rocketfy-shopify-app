import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    size : (RestClient, Graphql)=>{
        let width = async ()=>{
            return new Promise((resolve, reject)=>{
                let rs = await Graphql.query({ data: `
                    mutation  MetafieldDefinitionCreateMutation  ($input: MetafieldDefinitionInput!) {
                        metafieldDefinitionCreate(definition: $input) {
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `}, { variables : {
                        input: {
                            ownerType: "PRODUCT",
                            namespace: "dimensiones",
                            key: "ancho",
                            type: "number_integer",
                            validations: [],
                            name: "ancho",
                            description: "Defina en (cms) la anchura del paquete"
                        }
                }}).catch((e)=>reject(e));
                
                resolve(rs);
            });
        };
      
        return Promise.all([width]);
    }
 }

 export default MetafieldController