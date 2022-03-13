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
                              "name": "Ingredients",
                              "namespace": "bakery",
                              "key": "ingredients",
                              "description": "A list of ingredients used to make the product.",
                              "type": "multi_line_text_field",
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