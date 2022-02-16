import mongoose from 'mongoose';

const { Schema } = mongoose;

const SettingsSchema = new Schema({
    shop: { type: String, required: true  },
    customer : { type : String},
    customerID : {type: String },
    domain: { type: String },
    connected : {type: Boolean, default : false },
    webhook: { type: Boolean, default : false  },
    carrier: { type: Boolean, default : false  },
    urlRedirect : {  type : String },
    access_token : { type: String },
    sp_access_token : { type: String },
    metadata : { type : Object}
});

export default mongoose.model('Settings', SettingsSchema);