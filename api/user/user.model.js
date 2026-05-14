import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email / User Id required'],
        lowercase: true,
        unique: true,
        minlength: [10, 'Email / User Id  too short'],
        maxlength: [40, 'Email / User Id  too long'],
        trim: true,
        
    },
    password: {
        type: String,
        required: [true, 'password required'],
        minlength: [3, 'password too short'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name required'],
        minlength: [3, 'Name too short'],
        maxlength: [50, 'Name too long'],
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'User', 'Viewer'],
        default: 'User'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shopDetails',
        required: true,
    },
    expiryDate: { 
        type: Date, 
        required: true,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1]
    }
}, { timestamps: true, minimize: false });

const User = mongoose.model('logginAccessUser', userSchema);

export default User;