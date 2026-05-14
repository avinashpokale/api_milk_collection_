import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import Router from './router.js';

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use('',Router);

const start = async()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`app is running on port ${process.env.PORT}`);
    })
};
start();