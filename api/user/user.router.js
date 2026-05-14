import express from 'express';
const router = express.Router();

// Import your controller functions
import { 
    login, 
    getUsersById,
    getUser, 
    updateProfile, 
    getShopUsers, 
    getUsersByShop, 
    createUserAdmin, 
    updateUserAdmin, 
    deleteUserAdmin,
    getAllUserAdmin 
} from './user.controller.js';

import { checkToken,checkAdmin } from '../../auth/token-validation.js';
// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.post('/login', login);

// ==========================================
// 2. LOGGED-IN USER ROUTES (Self-Management)
// ==========================================
// Get own profile data
router.get('/profile', checkToken, getUser);

// Update own profile (Name, Phone, Email)
router.patch('/profile', checkToken, updateProfile);

// Get staff list for own shop (Used by Shop Owners)
router.get('/my-staff', checkToken, getShopUsers);

// ==========================================
// 3. ADMIN ONLY ROUTES
// ==========================================

// Create a new user for any shop
router.post('/admin', checkToken, checkAdmin, createUserAdmin);

// Update any user (Role, Shop, Expiry, Profile)
router.patch('/admin/:id', checkToken, checkAdmin, updateUserAdmin);

// Toggle user status (Active/Inactive)
router.delete('/admin/:id', checkToken, checkAdmin, deleteUserAdmin);

// Fetch all staff members belonging to a specific shop
router.get('/shop/:shopId', checkToken, checkAdmin, getUsersByShop);

router.get('/admin', checkToken, checkAdmin, getAllUserAdmin);

// Fetch specific staff members details
router.get('/:Id', checkToken, getUsersById);

export default router;