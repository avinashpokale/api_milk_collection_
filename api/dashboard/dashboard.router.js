import express from 'express';
import { 
    userDashboard, 
    adminDashboard,
} from './dashboard.controller.js';
import { checkToken, checkAdmin } from '../../auth/token-validation.js';

const router = express.Router();

// --- USER ROUTES ---
// Normal users only access these
router.get('/', checkToken, userDashboard);

// --- ADMIN ROUTES ---
// Only admin can access these
router.get('/admin', checkToken, checkAdmin, adminDashboard);

export default router;