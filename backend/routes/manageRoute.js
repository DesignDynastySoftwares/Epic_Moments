import express from 'express';
import { manageCategory } from '../models/manageCategory.js';

const router = express.Router();

// ✅ Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await manageCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Add a new category (public)
router.post('/add', async (req, res) => {
  try {
    let name = req.body.name?.trim().toLowerCase();

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await manageCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new manageCategory({ name });
    await newCategory.save();

    res.json({ success: true, message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Delete category by ID (public)
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await manageCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
