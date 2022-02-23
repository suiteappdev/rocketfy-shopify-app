import Sessions from "../models/Sessions"
import { Session } from '@shopify/shopify-api/dist/auth/session'
let domain_id = '';

const storeCallback = async (session)=>{
    try {
        let data = session;
        data.onlineAccessInfo = JSON.stringify(session.onlineAccessInfo);

        if(data.id.indexOf(`${data.shop}`) > -1){
            domain_id = data.id;
        }

        console.log("S", session);

        let obj = {
            shop_url : data.shop,
            session_id : data.id,
            domain_id : domain_id,
            accessToken : data.accessToken,
            state : data.state,
            isOnline : data.isOnline,
            onlineAccessInfo : data.onlineAccessInfo,
            scope : data.scope
        }

        let exist = await Sessions.findOne({session_id : session.id });

        if(exist){
            Sessions.updateOne({session_id : session.id}, obj);
        }else{
            let s = new Sessions({
                shop_url : data.shop,
                session_id : data.id,
                domain_id : domain_id,
                accessToken : data.accessToken,
                state : data.state,
                isOnline : data.isOnline,
                onlineAccessInfo : data.onlineAccessInfo,
                scope : data.scope
            });

            await s.save();
        }

        return true;

    } catch (e) {
        throw new Error(e);
    }
}

const loadCallback = async (id)=>{
    try {
        let session = new Session(id);

        console.log("session query", session)

        let rs =  await Sessions.findOne({session_id : session.id});
        console.log("rs", rs);

        if(rs){
            session.shop = rs.shop_url;
            session.state = rs.state;
            session.scope = rs.scope;
            session.isOnline = rs.isOnline == 'true' ? true : false;
            session.onlineAccessInfo = rs.onlineAccessInfo;
            session.accessToken = rs.accessToken;

            const date = new Date();
            date.setDate(date + 1);

            session.expires = date;

            if(session.expires && typeof session.expires == 'string'){
                session.expires = new Date(session.expires);
            }
        }

        return session;

    } catch (e) {
        throw new Error(e);
    }
}

const deleteCallback = async (id)=>{
    try {
        return false;
    } catch (e) {
        throw new Error(e)
    }
}

export {
    storeCallback,
    loadCallback,
    deleteCallback
}