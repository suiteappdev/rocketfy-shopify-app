const PostRequest = (url, body, headers)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${window.localStorage.getItem('rocketfy-token')}`},
            body : JSON.stringify(body)
        };

        const response = await fetch(url, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

const Post = (url, body)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body : JSON.stringify(body)
        };

        const response = await fetch(url, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

const getAcessToken  = ()=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partnerID : process.env.ROCKETFY_PARTNERID,
                api_key : process.env.ROCKETFY_APIKEY
            })
        };
       
        const response = await fetch(`http://localhost:4001/api/public/connect`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));

        resolve(data);        
    });
}

const refreshToken = ()=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${window.localStorage.getItem('rocketfy-token')}`},
            body : JSON.stringify({
                partnerID : process.env.ROCKETFY_PARTNERID,
                customerID : window.localStorage.getItem('rocketfy-customerid')
            })
        };

        const response = await fetch(`http://localhost:4001/api/public/refreshCustomerToken`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

const verifyUrl = (body)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${window.localStorage.getItem('rocketfy-token')}`},
            body : JSON.stringify(body)
        };

        const response = await fetch(`${process.env.HOST}/api/verify`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

export { PostRequest, getAcessToken, refreshToken, verifyUrl, Post }