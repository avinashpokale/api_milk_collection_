import mongoose from 'mongoose';


const shopSchema = new mongoose.Schema({
    shop_name: { type: String, required: true },
    owner_name: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gst_no:{type: String},
    license_no:{type: String},
    status: {
        type: Number,
        default: 1, // 1 = Active, 0 = Deleted/Inactive
        enum: [0, 1]
    }
}, { timestamps: true });

const Shop = mongoose.model('shopDetails', shopSchema);

export default Shop;