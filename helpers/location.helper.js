import { PostRequest } from "./request.helper";

const getCourrier = (cities, city)=>{
    return new Promise(async (resolve, reject)=>{
        
        let mapperCourrier  =  (c)=>{
            return c.cod
        }

        try {
                let courriers = cities.filter((c)=>c.name.toLowerCase() == city.toLowerCase());

                if(courriers.length > 0){
                    let avaliable = courriers[0].courriers.filter(mapperCourrier);

                    if(avaliable > 0){
                        return resolve(avaliable[0]);
                    }else{
                        resolve('Sin cobertura')
                    }                    
                }else{
                    resolve('Sin cobertura');
                }

        } catch (error) {
            reject(error);
        }

    });
}

const getCities = (cod)=>{
    return new Promise(async (resolve, reject)=>{
        let response = await PostRequest(`${process.env.ROCKETFY_APIHOST}/api/public/cities`, { cod : cod }).catch((e)=>reject(e));
        console.log("response", response);
        resolve(response.data);
    });
}

export { getCourrier, getCities }