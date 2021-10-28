import { PostRequest } from "./request.helper";

const coverage = ()=>{
    return new Promise(async (resolve, reject)=>{
        let data = await PostRequest(`${process.env.ROCKETFY_APIHOST}/api/public/cities`, { cod : true }).catch((e)=>reject(e));
        
        if(data){
            resolve(data);
        }
    });
}

export { coverage }