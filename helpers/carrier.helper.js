const createCarrier = () =>{
    return new Promise(async (resolve, reject)=>{
        let body ={
        carrier_service:
            {
                name:"TCC",
                callback_url:"http:\/\/tcc.com",
                service_discovery:true
            }
        }

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': `asdsa`},
            body : JSON.stringify(body)
        };

        const response = await fetch(`https://rocketfystore.myshopify.com/admin/api/2022-01/carrier_services.json`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

export {createCarrier}