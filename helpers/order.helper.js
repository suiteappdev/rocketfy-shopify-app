import { PostRequest } from "./request.helper";
import {getCustomerId} from './storage.helper';

const createOrder = (data)=>{
    return new Promise(async (resolve, reject)=>{
        let order = {
            "customerID":getCustomerId(),
            "id": 1,
            "currency": "COP",
            "shipping_total": "0",
            "subtotal": parseInt(data.currentSubtotalPriceSet.shopMoney.amount),
            "total": parseInt(data.currentTotalPriceSet.shopMoney.amount),
            "payment_method": "cod",
            "billing": {
              "first_name":data.customer.firstName,
              "last_name": data.customer.lastname,
              "company": "KonopimiTech",
              "address_1":  data.shippingAddress.address1,
              "address_2":  data.shippingAddress.address2,
              "city":  data.shippingAddress.city,
              "state": data.shippingAddress.province,
              "country": data.shippingAddress.countryCodeV2,
              "email": "konopimi@hotmail.com",
              "phone": "3329822"
            },
            "line_items": data.lineItems.edges.map((item)=>{
                return {
                    "id": 35,
                    "name": "Mouse",
                    "variation_name": "Mouse rojo",
                    "product_id": 13,
                    "variation_id": 0,
                    "quantity": 5,
                    "total": "160000.00",
                    "price": 80000,
                    "width": 10,
                    "height": 10,
                    "large": 1,
                    "weight": 2
                }
            })
        }

        let response = await PostRequest('https://api.rocketfy.co/api/public/createOrder', order).catch((e)=>reject(e));
        console.log("response orders", order);
        if(response){
            resolve(response);
        }
    });
}

export {createOrder}