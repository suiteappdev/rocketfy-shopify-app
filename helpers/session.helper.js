import dotenv from "dotenv";
import Sessions from "../models/Sessions"
import { Session } from '@shopify/shopify-api/dist/auth/session'
import Cryptr from "cryptr";
dotenv.config();

const cryption = new Cryptr(process.env.SHOPIFY_PWD_KEYS)

const storeCallback = async (session)=>{
    const result = await Sessions.findOne({ id: session.id });

    if (result === null) {
        let s = new Sessions({
            id : session.id,
            data : cryption.encrypt(JSON.stringify(session)),
            shop : session.shop
        });

        await s.save();
        
    } else {
        await Sessions.findOneAndUpdate( { id: session.id }, { data: cryption.encrypt(JSON.stringify(session)), shop: session.shop }
      );
    }

    return true;
}

const loadCallback = async (id)=>{
    try {
        const sessionResult = await Sessions.findOne({ id });

        if (sessionResult) {
            return JSON.parse(cryption.decrypt(sessionResult.data));
        }

    } catch (e) {
        throw new Error(e);
    }
}

const deleteCallback = async (id)=>{
    try {
        await Sessions.remove({ id });
        return true;
    } catch (e) {
        throw new Error(e)
    }
}

export {
    storeCallback,
    loadCallback,
    deleteCallback
}