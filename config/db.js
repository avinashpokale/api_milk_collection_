import mongoose from 'mongoose';

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.URL+process.env.db_Name);
        console.log(`connected to mongo db`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default connectDB;