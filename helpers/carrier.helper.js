const createCarrier = (token) =>{
    return new Promise(async (resolve, reject)=>{
            let body = { carrier_service : {
                name:"Rocketfy Carriers", callback_url:"https:\/\/shopify-dev.rocketfy.co/api/shippings", service_discovery:true }
            }

            const opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body : JSON.stringify(body)
            };
    
            const response = await fetch(`/carrier-service`, opts).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

const updateCarrier = (carrier, token) =>{
    return new Promise(async (resolve, reject)=>{
            const opts = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body : JSON.stringify({
                    carrier_service : carrier
                })
            };
    
            const response = await fetch(`/carrier-service/${carrier.id}`, opts).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

const deleteCarrier = (token, id) =>{
    return new Promise(async (resolve, reject)=>{
            let body = {
                id:id
            }
            
            const opts = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body : JSON.stringify(body)
            };
    
            const response = await fetch(`/carrier-service/${id}`, opts).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

const getCarriers = (token) =>{
    return new Promise(async (resolve, reject)=>{
            const opts = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            };
    
            const response = await fetch(`/carriers-service`, opts).catch(e=>reject(e));
            const data = await response.json().catch(e=>reject(e));
        
            resolve(data);
    });
}

export {createCarrier, deleteCarrier, getCarriers, updateCarrier}