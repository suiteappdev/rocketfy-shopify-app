import { useLocation } from "react-router-dom";
import axios from "axios";

const createCarrier = () =>{
    return new Promise(async (resolve, reject)=>{
        const search = useLocation().search;
        const at = new URLSearchParams(search).get('at');
        let body ={
                carrier_service:
                {
                    name:"TCC",
                    callback_url:"http:\/\/tcc.com",
                    service_discovery:true
                }
            }

        let data =  axios.post(`https://rocketfystore.myshopify.com/admin/api/2022-01/carrier_services.json`, body, {
            "X-Shopify-Access-Token": `${at}`
        }).catch(()=>reject(e));
       
        console.log("data", data);
        resolve(data);
    });
}

export default {createCarrier}