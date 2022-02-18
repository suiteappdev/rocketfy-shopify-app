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
       
        const response = await fetch(`http://localhost:4001/api/public/connect`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));

        resolve(data);        
    });
}

const refreshToken = (rocketfy_token, customerID)=>{
    console.log("rocketfytoken", rocketfy_token);
    return new Promise(async (resolve, reject)=>{
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${rocketfy_token}`},
            body : JSON.stringify({
                partnerID : process.env.ROCKETFY_PARTNERID,
                customerID : customerID
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
            headers: { 'Content-Type': 'application/json'},
            body : JSON.stringify(body)
        };

        const response = await fetch(`https://rocketfy-shopify-app.herokuapp.com/api/verify`, options).catch(e=>reject(e));
        const data = await response.json().catch(e=>reject(e));
    
        resolve(data);
    });
}

export { PostRequest, getAcessToken, refreshToken, verifyUrl, Post , Get, Put}