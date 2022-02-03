import { useLocation } from "react-router-dom";
import axios from "axios";

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

        let data =  axios.post(`https://rocketfystore.myshopify.com/admin/api/2022-01/carrier_services.json`, body, {
            "X-Shopify-Access-Token": `${''}`
        }).catch(()=>reject(e));
       
        console.log("data", data);
        resolve(data);
    });
}

export default {createCarrier}