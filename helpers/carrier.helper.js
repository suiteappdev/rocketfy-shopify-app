import { useLocation } from "react-router-dom";

const createCarrier = () =>{
    return new Promise(async (resolve, reject)=>{
        const search = useLocation().search;
        const at = new URLSearchParams(search).get('at');
        console.log("at", at);

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
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': `${at}`},
                body : JSON.stringify(body)
            };
    
            const response = await fetch(`https://rocketfystore.myshopify.com/admin/api/2022-01/carrier_services.json`, options).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

export default {createCarrier}