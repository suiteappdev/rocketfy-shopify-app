import axios from "axios";

console.log("env", process.env);

const OrderController  = {
    createOrder : (data, auth)=>{
        return new Promise(async (resolve, reject)=>{
                let headers = { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${auth.access_token}`};

                let order = {
                    "id" : data.name,
                    "customerID":auth.customerID,
                    "currency": data.current_total_price_set.shop_money.currency_code,
                    "shipping_total": 10000,
                    "subtotal": parseInt(data.current_subtotal_price_set.shop_money.amount),
                    "total": parseInt(data.current_total_price_set.shop_money.amount),
                    "coupon" : parseInt(data.total_discounts || 0),
                    "payment_method": "cod",
                    "dimensions" : {
                        width : 0, height : 0 , weight : Math.round(parseInt(data.total_weight / 1000)) , large : 0
                    },
                    "shipping" : data.shipping_address,
                    "billing": {
                        "first_name":data.billing_address.first_name,
                        "last_name": data.billing_address.last_name,
                        "address_1":  data.billing_address.address1,
                        "address_2":  data.billing_address.address2,
                        "city":  data.billing_address.city,
                        "state": data.shipping_address.province,
                        "country": data.billing_address.country_code,
                        "email": data.customer.email,
                        "phone": data.phone,
                    },
                    "line_items": data.line_items.map((item)=>{
                        return {
                            "name": item.name,
                            "variation_name": item.title,
                            "quantity": item.quantity,
                            "total": (parseInt(item.price) * item.quantity),
                            "price": parseInt(item.price),
                            "width": 0,
                            "height": 0,
                            "sku" : item.sku || '',
                            "large":0,
                            "weight": parseInt(item.grams / 1000)
                        }
                    }),
                    "carrier" : (data.shipping_lines.length > 0 ?  data.shipping_lines[0].title : 'servientrega')
                }

                let o = await axios.post(`http://8678-190-28-227-176.ngrok.io/api/public/v2/createOrders`, 
                        { orders : [order], dbname : auth.customerID}, 
                        { headers : headers }).catch((e)=>reject(e));
                
                if(o && o.data){
                    return resolve(o.data);
                }
        });
    },
    
    getShippingRates : (data, auth)=>{
        
        let total = (items)=>{
            let total = 0;

            if(items.length > 0){

                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    total = total + (parseInt(element.quantity) * parseInt(element.price));
                }
            }

            return total;
        }

        let weight = (items)=>{
            let total = 0;

            if(items.length > 0){

                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    total = total + (parseInt(element.quantity) * parseInt(element.grams) / 1000);
                }
            }

            return total;
        }

        let body  = { 
            "customerID" :auth.customerID,
            "total" : total(data.items),
            "lines" : {
                "from": { 
                    "city": data.origin.city, 
                    "departament": data.origin.province, 
                    "address": data.origin.adresss1 
                }, 
                "to": { 
                    "city":data.destination.city, 
                    "departament":data.destination.province, 
                    "address": data.destination.address1 
                }
             },
            "weight" : weight(data.items),
            "large" : 0,
            "height" : 0,
            "width" : 0,
            "cod" : true,
            "quantity" : 1
        }
        return new Promise(async (resolve, reject)=>{
            let headers = { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${auth.access_token}`}
            let rates = await axios.post(`http://8678-190-28-227-176.ngrok.io/api/public/v2/calculateShipping`, body, {
                headers : headers
            }).catch((e)=>reject(e));

            if(rates && rates.data){
                resolve(rates.data.data);
            }

        });
    },

    mapCarrier : (data)=>{
        return data.map((c)=>{
            return  { 
                "service_name": c.name,
                "service_code": !c.disabled  ? "ON" : "OFF", 
                "total_price": (c.shipping_value * 100), 
                "description":   `${c.fechaEntrega ? (`Fecha de entrega ${c.fechaEntrega}`) : (`Tiempo de entrega ${c.shipping_time} dia`) } `,
                "currency": "COP", 
                "min_delivery_date": "2013-04-12 14:48:45 -0400",
                "max_delivery_date": "2013-04-12 14:48:45 -0400" 
            }
        });
    }
}

export default OrderController;