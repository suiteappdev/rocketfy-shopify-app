import mongoose from 'mongoose';

const { Schema } = mongoose;

const ActivitySchema = new Schema({
    shop: { type: String, required: true  },
    reason :  { type: String },
    order :  { type: Object },
    status : { type: String}
});

export default mongoose.model('Activity', ActivitySchema);