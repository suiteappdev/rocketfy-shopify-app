import { getSessionToken } from "@shopify/app-bridge-utils";
const app = useAppBridge();
import { useAppBridge } from "@shopify/app-bridge-react";

const createCarrier = (at) =>{
    return new Promise(async (resolve, reject)=>{
        const app = useAppBridge();
        const token = await getSessionToken(app);
        console.log("token", token)
        let body = { name:"TCC", callback_url:"https:\/\/rocketfy-shopify-app.herokuapp.com/api/cotizador", service_discovery:true }
    
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body : JSON.stringify(body)
            };
    
            const response = await fetch(`/create-carrier-service`, options).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

export {createCarrier}