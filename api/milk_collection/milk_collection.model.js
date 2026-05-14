import mongoose from 'mongoose';

const milkCollectionSchema = new mongoose.Schema({
  shopId: {  type: mongoose.Schema.Types.ObjectId, ref: 'shopDetails', required: true},
  date: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  shift: { type: String,
        required: true,
        enum: ['M', 'E'],
        default: 'M'},
  qty: { type: Number, required: true },
  fat: { type: Number, required: true },
  snf: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: Number, default: 1 } // 1: Active, 0: Soft Delete
}, { timestamps: true });

export default mongoose.model('dailyCollection', milkCollectionSchema);