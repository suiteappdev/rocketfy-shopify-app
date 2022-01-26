import { PostRequest } from "./request.helper";
import {getCustomerId} from './storage.helper';

const createOrder = (data, shipping)=>{
    return new Promise(async (resolve, reject)=>{
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
              "city":  shipping.to.cityName,
              "state":shipping.to.stateName,
              "country": data.order.shippingAddress.countryCodeV2,
              "email": data.order.customer.email,
              "phone": data.order.customer.phone || '0'
            },
            "line_items": data.order.lineItems.edges.map((item)=>{
                return {
                    "id": 35,
                    "name": item.node.variant.displayName,
                    "variation_name": item.node.variant.displayName,
                    "quantity": item.node.quantity,
                    "total": parseInt(item.node.discountedTotalSet.shopMoney.amount),
                    "price": parseInt(item.node.variant.price),
                    "width": shipping.Ancho,
                    "height": shipping.Alto,
                    "large": shipping.Largo,
                    "weight": parseInt(item.node.variant.weight || shipping.Peso || 2)
                }
            })
        }

        console.log("order", order);

        let response = await PostRequest(`http://localhost:4001/api/public/v2/createOrders`, order).catch((e)=>reject(e));
        
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
                city:shipping.from.value,
                state:shipping.from.state, address:"", location:null
            },
            to:{ 
                city :shipping.to.value,
                state:shipping.to.state,
                address:"",
                location:null
            }, 
            quantity:parseInt(order.quantity || 1)
        }

        let response = await PostRequest('https://rest.rocketfy.co/api/calc/shipping', body).catch((e)=>reject(e));

        if(response){
            resolve(response.data);
        }
    });
}

export {createOrder, shippingCost}