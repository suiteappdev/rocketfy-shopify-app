import mongoose from 'mongoose';

const { Schema } = mongoose;

const SessionSchema = new Schema({
    shop_url : { type: String},
    session_id : { type: String },
    domain_id : { type: String },
    accessToken :  { type: String },
    state : { type: String },
    isOnline : { type: String },
    onlineAccessInfo :  { type: String },
    scope : { type: String}
});

export default mongoose.model('Sessions', SessionSchema);