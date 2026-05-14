import Shop from './shop.model.js';

// --- ADMIN FUNCTIONS ---

// 1. Create a new Shop
export const addShop = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;

        // If an _id is provided, we update the existing shop
        if (_id) {
            const updatedShop = await Shop.findByIdAndUpdate(
                _id,
                { ...updateData },
                { new: true, runValidators: true }
            );

            if (!updatedShop) {
                return res.status(404).json({ success: 0, message: "Shop not found" });
            }

            return res.status(200).json({ 
                success: 1, 
                message: "Shop updated successfully", 
                shop: updatedShop 
            });
        }

        // If no _id, create a new shop
        const newShop = new Shop({ ...updateData, status: 1 });
        const savedShop = await newShop.save();
        
        res.status(201).json({ 
            success: 1, 
            message: "Shop created successfully", 
            shop: savedShop 
        });

    } catch (error) {
        res.status(400).json({ success: 0, message: error.message });
    }
};

// 2. Admin gets ALL active/inactive shops
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.status(200).json({ success: 1, shops });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
};

// 3. Admin gets a specific shop by ID
export const getShopDetailsForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await Shop.findOne({ _id: id, status: 1 });
        
        if (!shop) {
            return res.status(404).json({ success: 0, message: "Shop not found" });
        }
        res.status(200).json({ success: 1, shop });
    } catch (error) {
        res.status(500).json({ success: 0, message: "Invalid ID or Server Error" });
    }
};

// 4. Admin deactivates (soft delete) a shop
export const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the shop first to check its current status
        const currentShop = await Shop.findById(id);

        if (!currentShop) {
            return res.status(404).json({ success: 0, message: "Shop not found" });
        }

        // 2. Toggle the status: if 1, make it 0. If 0, make it 1.
        const newStatus = currentShop.status === 1 ? 0 : 1;

        const updatedShop = await Shop.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );

        res.status(200).json({ 
            success: 1, 
            message: `Shop ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            status: updatedShop.status 
        });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
};

// --- USER FUNCTIONS ---

// 1. User gets their own shop details (linked via token)
export const getShopDetails = async (req, res) => {
    try {
        // Ensure shopId exists in token
        if (!req.decoded.shopId) {
            return res.status(400).json({ success: 0, message: "No shop associated with this user" });
        }

        const shop = await Shop.findOne({ 
            _id: req.decoded.shopId, 
            status: 1 
        });
        
        if (!shop) {
            return res.status(404).json({ success: 0, message: "Shop profile not found" });
        }
        res.status(200).json({ success: 1, shop });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
};

// 2. User update their own shop details
export const updatePersonalShop = async (req, res) => {
    try {
        if (!req.decoded.shopId) {
            return res.status(400).json({ success: 0, message: "No shop linked to your account" });
        }

        const updatedShop = await Shop.findByIdAndUpdate(
            req.decoded.shopId,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: 1, shop: updatedShop });
    } catch (error) {
        res.status(500).json({ success: 0, message: error.message });
    }
};