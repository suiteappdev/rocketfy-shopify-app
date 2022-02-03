const createCarrier = (token) =>{
    return new Promise(async (resolve, reject)=>{
            let body = { carrier_service : {
                name:"TCC", callback_url:"https:\/\/rocketfy-shopify-app.herokuapp.com/api/cotizador", service_discovery:true }
            }
            
            const opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body : JSON.stringify(body)
            };
    
            const response = await fetch(`/create-carrier-service`, opts).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

export {createCarrier}