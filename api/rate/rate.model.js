import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema({
  shopId: {  type: mongoose.Schema.Types.ObjectId, ref: 'shopDetails', required: true},
  rate: { type: Number, required: true },
  fatIncrement: { type: Number, required: true },
  fatDecrement: { type: Number, required: true },
  belowFat: { type: Number, required: true },
  belowFatDecrement: { type: Number, required: true },
  snfIncrement: { type: Number, required: true },
  snfDecrement: { type: Number, required: true },
  belowSnf: { type: Number, required: true },
  belowSnfDecrement: { type: Number, required: true },
  status: { type: Number, default: 1 }
}, { timestamps: true });

const Rate = mongoose.model('Rate', rateSchema);
export default Rate;