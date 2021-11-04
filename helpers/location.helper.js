import { PostRequest } from "./request.helper";
import { getJson, setJson } from "./storage.helper";

const getCourrier = (city, cod)=>{
    return new Promise(async (resolve, reject)=>{
        let courrier;

        if(getJson('cities-cache')){
            courrier = getJson('cities-cache').filter((c)=>c.name.toLowerCase() == city.toLowerCase());
            resolve(courrier);
        }else{
            let data = await PostRequest(`${process.env.ROCKETFY_APIHOST}/api/public/cities`, { cod : cod }).catch((e)=>reject(e));
            
            let city = data.data.filter((e)=>e.name.toLowerCase() == city.toLowerCase())[0];
            courrier = city.courriers.find((c)=>c.cod);

            resolve(courrier);            
        }
    });
}

const getCities = (cod)=>{
    return new Promise( async (resolve, reject)=>{
        let data = await PostRequest(`${process.env.ROCKETFY_APIHOST}/api/public/cities`, { cod : cod }).catch((e)=>reject(e));
        
        resolve(data.data);
    });
}

export { getCourrier, getCities }