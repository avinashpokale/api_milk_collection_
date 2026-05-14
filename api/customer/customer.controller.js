import Customer from './customer.model.js';
import mongoose from 'mongoose';

// 1. Create - POST /customer
export const create = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const { code, name } = req.body;

    // 1. Check if a customer with the same CODE already exists in THIS shop
    const existingCode = await Customer.findOne({ shopId, code, status:1 });
    if (existingCode) {
      return res.status(400).json({ 
        success: 0, 
        message: `Customer code ${code} is already assigned to ${existingCode.name}` 
      });
    }

    // 2. Check if a customer with the same NAME already exists in THIS shop
    const existingName = await Customer.findOne({ shopId, name, status:1  });
    if (existingName) {
      return res.status(400).json({ 
        success: 0, 
        message: `A customer named "${name}" already assigned to ${existingName.code} in your shop` 
      });
    }

    // 3. If both checks pass, save the customer
    const newCustomer = new Customer({ ...req.body, shopId });
    await newCustomer.save();

    res.status(201).json({ success: 1, message: "Customer saved successfully" });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

// 2. Update - PATCH /customer/:id
export const update = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, shopId, status: 1 },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: 0, message: "Customer not found" });
    res.status(200).json({ success: 1, message: "Customer updated successfully" });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// 3. GetAll - GET /customer
export const getAll = async (req, res) => {
  try {
    const shopId = req.decoded.shopId
    const customers = await Customer.find({ shopId, status: 1 });
    res.status(200).json({ success: 1, data: customers });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

// 4. GetById - GET /customer/:id
export const getById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const customer = await Customer.findOne({ _id: req.params.id, shopId, status: 1 });
    if (!customer) return res.status(404).json({ success: 0, message: "Customer not found" });
    res.status(200).json({ success: 1, data: customer });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};

// 5. DeleteById - DELETE /customer/:id (Soft Delete)
export const deleteById = async (req, res) => {
  try {
    const shopId = req.decoded.shopId;
    const deleted = await Customer.findOneAndUpdate(
      { _id: req.params.id, shopId },
      { status: 0 }
    );
    if (!deleted) return res.status(404).json({ success: 0, message: "Customer not found" });
    res.status(200).json({ success: 1, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: 0, message: error.message });
  }
};