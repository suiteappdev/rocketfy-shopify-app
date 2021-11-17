import { PostRequest } from "./request.helper";
import {getCustomerId} from './storage.helper';

const createOrder = (data)=>{
    return new Promise(async (resolve, reject)=>{
        let shippingCost = await shippingCost(data.shippingAddress);
        console.log("shippingCost", shippingCost);
        resolve();
        /*let order = {
            "customerID":getCustomerId(),
            "id": 1,
            "currency": data.currentTotalPriceSet.shopMoney.currencyCode,
            "shipping_total": shippingCost,
            "subtotal": parseInt(data.currentSubtotalPriceSet.shopMoney.amount),
            "total": parseInt(data.currentTotalPriceSet.shopMoney.amount),
            "payment_method": "cod",
            "billing": {
              "first_name":data.customer.firstName,
              "last_name": data.customer.lastName,
              "company": "",
              "address_1":  data.shippingAddress.address1,
              "address_2":  data.shippingAddress.address2,
              "city":  data.shippingAddress.city,
              "state": data.shippingAddress.province,
              "country": data.shippingAddress.countryCodeV2,
              "email": "",
              "phone": ""
            },
            "line_items": data.lineItems.edges.map((item)=>{
                return {
                    "id": 35,
                    "name": item.name,
                    "variation_name": item.variant.displayName,
                    "product_id": 13,
                    "variation_id": 0,
                    "quantity": item.quantity,
                    "total": parseInt(item.discountedTotalSet.shopMoney.amount),
                    "price": parseint(item.variant.price),
                    "width": 10,
                    "height": 10,
                    "large": 10,
                    "weight": parseInt(item.variant.weight)
                }
            })
        }

        let response = await PostRequest('https://api.rocketfy.co/api/public/createOrder', order).catch((e)=>reject(e));
        console.log("response orders", order);
        if(response){
            resolve(response);
        }*/
    });
}

const shippingCost = (order)=>{
    return new Promise(async (resolve, reject)=>{
        let shipping = {
            weight : order.weight,
            large : 10,
            height : 10,
            width : 10,
            cod : true,
            lines : { 
                from: { 
                  city:order.shop.billingAddress.city, 
                  departament: order.shop.billingAddress.province, 
                  address:order.shop.billingAddress.address1
                }, 
                to: { 
                  city: order.shippingAddress.city, 
                  departament: order.shippingAddress.province, 
                  address: order.shippingAddress.address1 
                } 
            }
        }

        let response = await PostRequest('https://api.rocketfy.co/api/public/calculateShipping', shipping).catch((e)=>reject(e));
        
        if(response){
            resolve(response);
        }
    });
}

export {createOrder, shippingCost}