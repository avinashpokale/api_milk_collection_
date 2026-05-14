import User from '../user/user.model.js';
import Shop from '../shop/shop.model.js';

/**
 * Returns high-level metrics for the Admin Dashboard
 */
export async function adminDashboard(req, res) {
    try {
        const today = new Date();
        const in3Days = new Date(new Date().setDate(today.getDate() + 3));
        const in30Days = new Date(new Date().setDate(today.getDate() + 30));

        const [
            totalStaff, 
            activeStaff, 
            totalShops, 
            activeShops, 
            expire30, 
            expire3, 
            expired,
            expiringSoonList
        ] = await Promise.all([
            // 1. Total Staff (Excluding Admin)
            User.countDocuments({ role: { $ne: 'Admin' } }),

            // 2. Active Staff (Status 1)
            User.countDocuments({ role: { $ne: 'Admin' }, status: 1 }),

            // 3. Total Shops
            Shop.countDocuments({}),

            // 4. Active Shops
            Shop.countDocuments({ status: 1 }),

            // 5. Expire in 30 days (Between today and 30 days from now)
            User.countDocuments({ 
                role: { $ne: 'Admin' },
                expiryDate: { $gt: today, $lte: in30Days } 
            }),

            // 6. Expire in 3 days
            User.countDocuments({ 
                role: { $ne: 'Admin' },
                expiryDate: { $gt: today, $lte: in3Days } 
            }),

            // 7. Expired (Already passed)
            User.countDocuments({ 
                role: { $ne: 'Admin' },
                expiryDate: { $lt: today } 
            }),

            // 8. Fetch the actual list for the UI table (Users expiring in 30 days)
            User.find({ 
                role: { $ne: 'Admin' },
                expiryDate: { $lte: in30Days } // Change $gt: today to just $lte: in30Days
            })
            .select('name email expiryDate shopId')
            .populate({ path: 'shopId', select: 'shop_name' })
            .sort({ expiryDate: 1 }) // Expired ones show at the top
            .limit(15)
        ]);

        res.status(200).json({
            success: 1,
            data: {
                totalStaff,
                activeStaff,
                totalShops,
                activeShops,
                expire30,
                expire3,
                expired,
                expiringSoonList
            }
        });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}

export async function userDashboard(req,res) {
    
}