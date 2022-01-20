import { PostRequest } from "./request.helper";
import {getCustomerId} from './storage.helper';

const createOrder = (data)=>{
    return new Promise(async (resolve, reject)=>{
        //let shipping = await shippingCost(data);
        let order = {
            "customerID":getCustomerId(),
            "id": 1,
            "currency": data.order.currentTotalPriceSet.shopMoney.currencyCode,
            "shipping_total": 10000,
            "subtotal": parseInt(data.order.currentSubtotalPriceSet.shopMoney.amount),
            "total": parseInt(data.order.currentTotalPriceSet.shopMoney.amount),
            "payment_method": "cod",
            "billing": {
              "first_name":data.order.customer.firstName,
              "last_name": data.order.customer.lastName,
              "company": "",
              "address_1":  data.order.shippingAddress.address1,
              "address_2":  data.order.shippingAddress.address2,
              "city":  data.order.shippingAddress.city,
              "state": data.order.shippingAddress.province,
              "country": data.order.shippingAddress.countryCodeV2,
              "email": "test@gmail.com",
              "phone": "301290552"
            },
            "line_items": data.order.lineItems.edges.map((item)=>{
                return {
                    "id": 35,
                    "name": item.name,
                    "variation_name": item.node.variant.displayName,
                    "product_id": 13,
                    "variation_id": 0,
                    "quantity": item.quantity.quantity,
                    "total": parseInt(item.node.discountedTotalSet.shopMoney.amount),
                    "price": parseint(item.node.variant.price),
                    "width": 10,
                    "height": 10,
                    "large": 10,
                    "weight": parseInt(item.node.variant.weight || 2)
                }
            })
        }

        let response = await PostRequest(`${process.env.ROCKETFY_API_PUBLIC}api/public/createOrder`, order).catch((e)=>reject(e));
        
        if(response){
            resolve(response);
        }
    });
}

const shippingCost = (data)=>{
    return new Promise(async (resolve, reject)=>{
       let shipping = {
            weight : (parseInt(data.order.currentTotalWeight) / 1000),
            large : 10,
            height : 10,
            width : 10,
            cod : true,
            total : parseInt(data.order.currentTotalPriceSet.shopMoney.amount),
            lines : { 
                from: { 
                  city:data.shop.billingAddress.city, 
                  departament: data.shop.billingAddress.province, 
                  address:data.shop.billingAddress.address1
                }, 
                to: { 
                  city: data.order.shippingAddress.city, 
                  departament: data.order.shippingAddress.province, 
                  address: data.order.shippingAddress.address1 
                } 
            }
        }

        let response = await PostRequest('https://api.rocketfy.co/api/public/calculateShipping', shipping).catch((e)=>reject(e));

        if(response){
            console.log("response", response);
            resolve(response);
        }
    });
}

export {createOrder, shippingCost}