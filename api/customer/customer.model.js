import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shopDetails',
    required: true
  },
  code: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: Number, default: 1 } // 1: Active, 0: Soft Deleted
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);