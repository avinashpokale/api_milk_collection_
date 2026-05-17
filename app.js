import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import Router from './router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
dotenv.config();
connectDB();

// Calculate __dirname replacement for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('', Router);

const start = async () => {
    app.listen(process.env.PORT, () => {
        console.log(`app is running on port ${process.env.PORT}`);
    });
};
start();