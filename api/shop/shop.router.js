import express from 'express';
import { 
    getShopDetails, 
    updatePersonalShop, 
    addShop,
    getAllShops, 
    getShopDetailsForAdmin,
    deleteShop 
} from './shop.controller.js';
import { checkToken, checkAdmin ,checkUser} from '../../auth/token-validation.js';

const router = express.Router();

// --- USER ROUTES ---
// Normal users only access these
router.get('/', checkToken, getShopDetails);
router.patch('/', checkToken, checkUser, updatePersonalShop);

// --- ADMIN ROUTES ---
// Only admin can access these
router.post('/admin', checkToken, checkAdmin, addShop);
router.get('/admin', checkToken, checkAdmin, getAllShops);
router.get('/admin/:id', checkToken, checkAdmin, getShopDetailsForAdmin);
router.delete('/admin/:id', checkToken, checkAdmin, deleteShop);

export default router;