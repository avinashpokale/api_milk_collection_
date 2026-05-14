import express from 'express';
import {checkToken} from './auth/token-validation.js';
import userRouter from './api/user/user.router.js';
import shopRouter from './api/shop/shop.router.js';
import dashboardRouter from './api/dashboard/dashboard.router.js'
import rateRouter from './api/rate/rate.router.js';
import customerRouter from './api/customer/customer.router.js';
import collectionRouter from './api/milk_collection/milk_collection.router.js';

const app = express();

app.use('/user',userRouter);
app.use('/shop',shopRouter);
app.use('/dashboard',dashboardRouter);
app.use('/rate',checkToken,rateRouter);
app.use('/customer',checkToken,customerRouter);
app.use('/milk_collection',checkToken,collectionRouter);
app.get('/ping', (req, res) => {
  res.status(200).json({ success: 1,data:'Backend Server is Live'});
});


export default app;