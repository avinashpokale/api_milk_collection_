import User from './user.model.js';
import Shop from '../shop/shop.model.js'; // Assuming the path
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';

// ==========================================
// 1. SHARED HELPER FUNCTIONS
// ==========================================

/**
 * Converts any date into a JS Date object set to 11:59:59 PM IST.
 * This ensures the user has access until the very last second of their expiry day.
 */
const getEndOfDayIndia = (dateInput) => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    // Force conversion to India Timezone string
    const indiaTimeStr = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const finalDate = new Date(indiaTimeStr);
    // Lock to the last millisecond of that day
    finalDate.setHours(23, 59, 59, 999);
    return finalDate;
};

/**
 * Gets the current real-time clock in India, regardless of where the server is hosted.
 */
const getIndiaTime = () => {
    const now = new Date();
    const indiaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(indiaTimeStr);
};

// ==========================================
// 2. AUTHENTICATION (Login)
// ==========================================

export async function login(req, res) {
    const body = req.body;
    const email = body.email.toLowerCase();
    try {
        const user = await User.findOne({ email, status: 1 })
            .select('-__v -status -createdAt -updatedAt') 
            .populate({
                path: 'shopId',
                select: 'shop_name address phone'
            });

        if (user) {
            // --- UPDATED EXPIRY CHECK LOGIC ---
            if (user.role !== 'Admin' && user.expiryDate) {
                const todayIndia = getIndiaTime();
                const expiryDateIST = getEndOfDayIndia(user.expiryDate);

                if (todayIndia > expiryDateIST) {
                    console.log("today",todayIndia,"expiry",expiryDateIST)
                    return res.status(403).json({ 
                        success: 0, 
                        message: "Your subscription has expired. Please contact support." 
                    });
                }
            }
            
            const validateUser = compareSync(body.password, user.password);
            if (validateUser) {
                const jsontoken = jwt.sign(
                    { id: user._id, role: user.role, shopId: user.shopId?._id },
                    process.env.JWT_KEY,
                    { expiresIn: "1h" }
                );

                const userResponse = user.toObject();
                delete userResponse.password;

                return res.status(200).json({
                    success: 1,
                    message: "Login successful. Welcome, " + userResponse.name,
                    token: jsontoken,
                    expiresIn: 3600,
                    user: userResponse
                });
            }
        }
        return res.status(401).json({ success: 0, message: "Invalid Email / User Id  or Password" });
    } catch (error) {
        return res.status(500).json({ success: 0, message: "Server Error" });
    }
}

// ==========================================
// 3. ADMIN ONLY FUNCTIONS (With Date Logic)
// ==========================================

export async function createUserAdmin(req, res) {
    try {
        const body = req.body;
        if (!body.password) return res.status(400).json({ success: 0, message: "Password is required" });

        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        
        // Ensure expiry is stored as End of Day India
        if (body.expiryDate) {
            body.expiryDate = getEndOfDayIndia(body.expiryDate);
        }
        
        const user = new User(body);
        await user.save();
        
        res.status(200).json({ success: 1, message: "User created and assigned successfully" });
    } catch (error) {
        res.status(400).json({ success: 0, message: error.message });
    }
}

export async function updateUserAdmin(req, res) {
    try {
        const { id } = req.params;
        const { name, email, role, shopId, expiryDate, password } = req.body;

        let updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (shopId) updateData.shopId = shopId;
        
        // Ensure updated expiry is stored as End of Day India
        if (expiryDate) {
            updateData.expiryDate = getEndOfDayIndia(expiryDate);
        }
        
        if (password){
            const salt = genSaltSync(10);
            updateData.password = hashSync(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ success: 0, message: "User not found" });

        res.status(200).json({ success: 1, message: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ success: 0, message: error.message });
    }
}

// ==========================================
// 4. GENERAL USER FUNCTIONS
// ==========================================

export async function getUsersById(req, res) {
    try {
        const { Id } = req.params;
        const user = await User.findById(Id).select('-password');
        res.status(200).json({ success: 1, user });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}

export async function getUser(req, res) {
    try {
        const user = await User.findById(req.decoded.id).select('-password');
        if (!user) return res.status(404).json({ success: 0, message: "User not found" });
        return res.status(200).json({ success: 1, user });
    } catch (error) {
        return res.status(400).json({ success: 0, message: error.message });
    }
}

export async function updateProfile(req, res) {
    try {
        const { name, email, phone, password, oldPassword } = req.body;
        let updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;
        
        if (password) {
            const user = await User.findById(req.decoded.id);
            const isMatch = compareSync(oldPassword, user.password);
            if (!isMatch) return res.status(401).json({ success: 0, message: "Current password incorrect" });
            const salt = genSaltSync(10);
            updateFields.password = hashSync(password, salt);
        }

        await User.findByIdAndUpdate(req.decoded.id, { $set: updateFields });
        return res.status(200).json({ success: 1, message: "Profile updated successfully" });
    } catch (error) {
        res.status(400).json({ success: 0, message: error.message });
    }
}

export async function getShopUsers(req, res) {
    try {
        const users = await User.find({ 
            shopId: req.decoded.shopId, 
            status: 1 
        }).select('-password');
        res.status(200).json({ success: 1, users });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}

export async function getUsersByShop(req, res) {
    try {
        const { shopId } = req.params;
        const users = await User.find({ shopId }).select('-password');
        const shop = await Shop.findById(shopId).select('shop_name');
        res.status(200).json({ 
            success: 1, 
            users, 
            shopName: shop ? shop.shop_name : 'Shop' 
        });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}

export async function deleteUserAdmin(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: 0, message: "User not found" });

        const newStatus = user.status === 1 ? 0 : 1;
        const updatedUser = await User.findByIdAndUpdate(id, { status: newStatus }, { new: true });
        
        res.status(200).json({ 
            success: 1, 
            message: `User ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            status: updatedUser.status 
        });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}

export async function getAllUserAdmin(req, res) {
    try {
        const users = await User.find({ role: { $ne: 'Admin' } })
            .populate({ path: 'shopId', select: 'shop_name' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: 1, users });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
}