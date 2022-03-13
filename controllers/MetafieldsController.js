import { DataType } from "@shopify/shopify-api";

const MetafieldController  =  {
    size : (RestClient, Graphql)=>{
        let width = new Promise(async (resolve, reject)=>{
            await Graphql.query({ data: `
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
            }});
        });

        let height = new Promise(async (resolve, reject)=>{
            await Graphql.query({ data: `
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
                    key: "alto",
                    type: "number_integer",
                    validations: [],
                    name: "alto",
                    description: "Defina en (cms) la altura del paquete"
                }
            }});
        });

        let large = new Promise(async (resolve, reject)=>{
            await Graphql.query({ data: `
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
                    key: "largo",
                    type: "number_integer",
                    validations: [],
                    name: "largo",
                    description: "Defina en (cms) la longitud del paquete"
                }
            }});
        });

        return Promise.all([width, height, large]);
    }
 }

 export default MetafieldController