import mongoose from 'mongoose';

const { Schema } = mongoose;

const SessionSchema = new Schema({
    id : { type: String},
    shop : { type: String },
    data : { type: String }
});

export default mongoose.model('Sessions', SessionSchema);