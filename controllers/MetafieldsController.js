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
                
                resolve(rs);
            });
        };

        let height = ()=>{
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
                              "name": "alto",
                              "namespace": "dimensiones",
                              "pin" : true,
                              "key": "alto",
                              "description": "defina el alto de su producto",
                              "type": "number_integer",
                              "ownerType": "PRODUCT"
                            }
                        },
                    }
                }).catch((e)=>console.log(e));
                
                resolve(rs);
            });
        };

        let large = ()=>{
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
                              "name": "largo",
                              "namespace": "dimensiones",
                              "pin" : true,
                              "key": "largo",
                              "description": "defina el largo de su producto",
                              "type": "number_integer",
                              "ownerType": "PRODUCT"
                            }
                        },
                    }
                }).catch((e)=>console.log(e));
                
                resolve(rs);
            });
        };
      
        return Promise.all([width(), height(), large()]);
    }
 }

 export default MetafieldController