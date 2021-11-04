import { PostRequest } from "./request.helper";
import { getJson, setJson } from "./storage.helper";

const getCourrier = (cities, city)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            courrier = cities.filter((c)=>c.name.toLowerCase() == city.toLowerCase());
            resolve(courrier);
        } catch (error) {
            reject(error);
        }

    });
}

const getCities = (cod)=>{
    return new Promise( async (resolve, reject)=>{
        let response = await PostRequest(`${process.env.ROCKETFY_APIHOST}/api/public/cities`, { cod : cod }).catch((e)=>reject(e));
        resolve(response.data);
    });
}

export { getCourrier, getCities }