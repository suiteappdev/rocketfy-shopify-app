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
});

export default mongoose.model('Settings', SettingsSchema);