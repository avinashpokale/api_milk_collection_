import Rate from './rate.model.js';

// 1. Create - POST /rate
export const create = async (req, res) => {
  try {
    const shopId = req.decoded.shopId; // Extract from token
    const newRate = new Rate({ ...req.body, shopId });
    await newRate.save();
    res.status(201).json({ success: 1, message: "Rate saved successfully" });
  } catch (err) {
    res.status(400).json({ success: 0, message: err.message });
  }
};

// 2. Update - PATCH /rate
export const update = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    // Filters by BOTH shopId and status
    const updatedRate = await Rate.findOneAndUpdate(
      { shopId, status: 1 }, 
      req.body, 
      { new: true, upsert: true }
    );
    if (updatedRate) {
        res.status(200).json({ success: 1, message: "Rate updated successfully" });
    }
  } catch (err) {
    res.status(400).json({ success: 0, message: err.message });
  }
};

// 3. GetAll - GET /rate
export const getAll = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const rates = await Rate.find({ shopId, status: 1 });
    res.status(200).json({ success: 1, data: rates });
  } catch (err) {
    res.status(500).json({ success: 0, message: err.message });
  }
};

// 4. GetById - GET /rate/:id
export const getById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const rate = await Rate.findOne({ _id: req.params.id, shopId, status: 1 });
    if (!rate) return res.status(404).json({ success: 0, message: "Rate not found" });
    res.status(200).json({ success: 1, data: rate });
  } catch (err) {
    res.status(500).json({ success: 0, message: err.message });
  }
};

// 5. DeleteById - DELETE /rate/:id
export const deleteById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    // Ensure the user owns the record they are trying to delete
    const deleted = await Rate.findOneAndUpdate(
        { _id: req.params.id, shopId }, 
        { status: 0 }
    );
    if (!deleted) return res.status(404).json({ success: 0, message: "Rate not found or unauthorized" });
    res.status(200).json({ success: 1, message: "Rate deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: 0, message: err.message });
  }
};