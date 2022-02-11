import axios from "axios";

const OrderController  = {
    createOrder : (order)=>{
        return new Promise((resolve, reject)=>{
            let o = await axios.post(order).catch((e)=>reject(e));

            if(o && o.data){
                return resolve(o.data);
            }
        });
    }
}

export default OrderController;