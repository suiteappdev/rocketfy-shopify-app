import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const url = process.env.NODE_ENV == 'production'  ?  process.env.APIPUBLIC_PRO : process.env.APIPUBLIC_DEV

const OrderController  = {
    createOrder : (data, auth, client)=>{
        return new Promise(async (resolve, reject)=>{
                let headers = { 'Content-Type': 'application/json', 'Authorization' : `Bearer ${auth.access_token}`};
                let rs  = await axios.post('https://city-predictor.herokuapp.com/cities', { query : data.shipping_address.city});
                let city;
                let state;

                if(rs.data){
                    city = rs.data.name;
                    state = rs.data.state.name;
                }

                let mapImage  =  (collection, id)=>{
                    let ret = [];

                    console.log("images", collection);
            
                    collection.forEach(image => {
                        if(image.variant_ids.length > 0){
                            if(image.variant_ids.some(variant => variant == id)){
                                console.log("image.variant_ids", image.variant_ids);
                                return ret.push(image)
                            }
                        }
                    });
                    
                    return ret;
                }

                let order = {
                    "id" : data.name,
                    "customerID":auth.customerID,
                    "currency": data.current_total_price_set.shop_money.currency_code,
                    "shipping_total": parseInt(data.total_shipping_price_set.shop_money.amount),
                    "subtotal": parseInt(data.current_subtotal_price_set.shop_money.amount),
                    "total": parseInt(data.current_total_price_set.shop_money.amount),
                    "coupon" : parseInt(data.total_discounts || 0),
                    "payment_method": "cod",
                    "dimensions" : {
                        width : 0, height : 0 , weight : Math.round(parseInt(data.total_weight / 1000)) , large : 0
                    },
                    "shipping" : {...data.shipping_address, province : state, city : city},
                    "billing": {
                        "first_name":data.billing_address.first_name,
                        "last_name": data.billing_address.last_name,
                        "address_1":  data.billing_address.address1,
                        "address_2":  data.billing_address.address2,
                        "city":  city,
                        "state": state,
                        "country": data.billing_address.country_code,
                        "email": data.customer.email,
                        "phone": data.phone,
                    },
                    "line_items": data.line_items.map((item)=>{
                        return {
                            "product_id" : item.product_id,
                            "name": item.name,
                            "variation_name": item.title,
                            "quantity": item.quantity,
                            "total": (parseInt(item.price) * item.quantity),
                            "price": parseInt(item.price),
                            "width": 0,
                            "height": 0,
                            "sku" : item.sku || '',
                            "large":0,
                            "weight": parseInt(item.grams / 1000),
                            "variation_id" : item.variant_id
                        }
                    }),
                    "carrier" : (data.shipping_lines.length > 0 ?  data.shipping_lines[0].title : 'servientrega'),
                    "notes" : data.note
                }

                if(order.line_items.length > 0){
                    for (let index = 0; index < order.line_items.length; index++) {
                        const line = order.line_items[index];

                        let response  = await client.get({
                            path:`products/${line.product_id}/images`,
                        });

                        if(mapImage(response.body.images, line.variation_id).length > 0){
                            let src = mapImage(response.body.images, line.variation_id)[0].src;
                            order.line_items[index].image = src;
                        }
                    }
                }

                console.log("order", order);

                let o = await axios.post(`${url}api/public/v2/createOrders`, 
                        { orders : [order], dbname : auth.customerID}, 
                        { headers : headers }).catch((e)=>console.log(e));
                
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
            let rates = await axios.post(`${url}api/public/v2/calculateShipping`, body, {
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
    },

}

export default OrderController;