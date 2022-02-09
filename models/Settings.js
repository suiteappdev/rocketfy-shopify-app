import mongoose from 'mongoose';

const { Schema } = mongoose;
const SettingsSchema = new Schema({
  shop: {
      type: String,
      required: true
  },
  url: {
      type: String,
  },
  webhook: {
    type: Boolean,
    default : false
  },
  carrier: {
    type: Boolean,
    default : false
  },
  rocketfy_token : {
    type : String,
  }
});

export default mongoose.model('Settings', SettingsSchema);