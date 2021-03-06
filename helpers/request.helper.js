const PostRequest = (url, body)=>{
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

const Put = (url, body)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body : JSON.stringify(body)
        };

        const response = await fetch(url, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

const Get = (url)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
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
       
        const response = await fetch(`${process.env.APIPUBLIC}api/public/connect`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));

        resolve(data);        
    });
}

const refreshToken = (rocketfy_token, customerID)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${rocketfy_token}`},
            body : JSON.stringify({
                partnerID : process.env.ROCKETFY_PARTNERID,
                customerID : customerID
            })
        };

        const response = await fetch(`${process.env.APIPUBLIC}api/public/refreshCustomerToken`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

const verifyUrl = (body)=>{
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body : JSON.stringify(body)
        };

        const response = await fetch(`api/verify`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

export { PostRequest, getAcessToken, refreshToken, verifyUrl, Post , Get, Put}