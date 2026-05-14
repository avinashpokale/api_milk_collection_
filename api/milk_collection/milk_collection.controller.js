import MilkCollection from './milk_collection.model.js';

// --- PRIVATE HELPER FUNCTION ---
/**
 * Internal logic to check for existing records.
 * @param {String} date - The collection date.
 * @param {String} customerId - The MongoDB ID of the customer.
 * @param {String} shopId - The owner shop ID.
 * @param {String} excludeId - (Optional) The ID of the record to ignore (used in updates).
 */
const isDuplicateRecord = async (date, customerId, shopId, excludeId = null) => {
  const query = {
    date,
    customerId,
    shopId,
    status: 1
  };

  // If excludeId is provided, don't count the current record as a duplicate of itself
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await MilkCollection.findOne(query);
  return !!existing;
};

// --- EXPORTED CONTROLLERS ---

// 1. Dedicated API endpoint for frontend "live" checking
export const checkUniqueness = async (req, res) => {
  try {
    const { date, customerId } = req.query;
    const shopId = req.decoded.shopId;

    const exists = await isDuplicateRecord(date, customerId, shopId);

    res.status(200).json({ 
      success: 1, 
      exists 
    });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

// 2. Create Record with internal security check
export const create = async (req, res) => {
  try {
    const { date, customerId } = req.body;
    const shopId = req.decoded.shopId;

    // Security Check: Prevent duplicate via direct API hit
    const duplicate = await isDuplicateRecord(date, customerId, shopId);
    if (duplicate) {
      return res.status(400).json({ success: 0, message: "Entry already exists for this customer on this date." });
    }

    const newRecord = new MilkCollection({ ...req.body, shopId });
    await newRecord.save();
    res.status(201).json({ success: 1, message: "Milk record saved successfully" });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// 3. Update Record with internal security check
export const update = async (req, res) => {
  try {
    const { date, customerId } = req.body;
    const shopId = req.decoded.shopId;
    const recordId = req.params.id;

    // Security Check: Ensure changing this record doesn't create a duplicate with another record
    const duplicate = await isDuplicateRecord(date, customerId, shopId, recordId);
    if (duplicate) {
      return res.status(400).json({ success: 0, message: "Another record already exists with this date and customer." });
    }

    const updated = await MilkCollection.findOneAndUpdate(
      { _id: recordId, shopId, status: 1 },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: 0, message: "Record not found" });
    res.status(200).json({ success: 1, message: "Milk record updated successfully" });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// export const getAll = async (req, res) => {
//   try {
//     const shopId = req.decoded.shopId;
//     // Population added to get Customer Name
//     const data = await MilkCollection.find({ shopId, status: 1 })
//       .populate('customerId', 'name')
//       .sort({ createdAt: -1 });
//     res.status(200).json({ success: 1, data });
//   } catch (error) {
//     res.status(500).json({ success: 0, message: error.message });
//   }
// };

// src/milk_collection/milk_collection.controller.js

export const getAll = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const { startDate, endDate, customerId } = req.query;

    // Build the query object
    let query = { 
      shopId, 
      status: 1,
      date: { $gte: startDate, $lte: endDate }
    };

    // Filter by customer if provided
    if (customerId && customerId !== 'all') {
      query.customerId = customerId;
    }
    const data = await MilkCollection.find(query)
      .populate('customerId', 'name code') // Populate name and code
      .sort({ date: 1, createdAt: 1 });
      
    res.status(200).json({ success: 1, data });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const data = await MilkCollection.findOne({ _id: req.params.id, shopId, status: 1 }).populate('customerId', 'name');
    if (!data) return res.status(404).json({ success: 0, message: "Record not found" });
    res.status(200).json({ success: 1, data });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const deleted = await MilkCollection.findOneAndUpdate(
      { _id: req.params.id, shopId },
      { status: 0 }
    );
    if (!deleted) return res.status(404).json({ success: 0, message: "Record not found" });
    res.status(200).json({ success: 1, message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};