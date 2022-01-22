import { PostRequest } from "./request.helper";
import {getCustomerId} from './storage.helper';

const createOrder = (data)=>{
    return new Promise(async (resolve, reject)=>{
        //let shipping = await shippingCost(data);
        let order = {
            "id" : data.order.name,
            "customerID":getCustomerId(),
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
                    "quantity": item.node.quantity,
                    "total": parseInt(item.node.discountedTotalSet.shopMoney.amount),
                    "price": parseInt(item.node.variant.price),
                    "width": 10,
                    "height": 10,
                    "large": 10,
                    "weight": parseInt(item.node.variant.weight || 2)
                }
            })
        }

        let response = await PostRequest(`http://localhost:3000/api/public/createOrder`, order).catch((e)=>reject(e));
        
        if(response){
            resolve(response);
        }
    });
}

const shippingCost = (order, shipping)=>{
    return new Promise(async (resolve, reject)=>{


        let body = {
            calculate_all:true,
            total:parseInt(order.currentTotalPriceSet.shopMoney.amount),
            cod:true,
            dimensions:{ width:parseInt(shipping.Ancho), height:parseInt(shipping.Alto), large:parseInt(shipping.Largo), weight:parseInt(shipping.Peso) },
            from:{
                city:shipping.from,
                state:shipping.from.state, address:"", location:null
            },
            to:{ 
                city :shipping.to,
                state:shipping.state,
                address:"",
                location:null
            }, 
            quantity:parseInt(order.quantity)
        }

        let response = await PostRequest('https://rest.rocketfy.co/api/public/calc/shipping', body).catch((e)=>reject(e));

        if(response){
            console.log("response", response);
            resolve(response);
        }
    });
}

export {createOrder, shippingCost}