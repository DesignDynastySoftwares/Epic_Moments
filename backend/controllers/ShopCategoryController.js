import ShopCategory from "../models/ShopCategoryModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD
export const addShopCategory = async (req, res) => {
  try {
    const { name, iconType, order, navigateTo } = req.body;

    if (!name) return res.json({ success: false, message: "Name is required" });
    if (!req.file) return res.json({ success: false, message: "Image is required" });

    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "shopCategories",
    });
    fs.unlinkSync(req.file.path);

    const cat = new ShopCategory({
      name,
      iconType: iconType || "desk",
      order: order ? parseInt(order) : 0,
      navigateTo: navigateTo || "/collections",
      image: { url: uploaded.secure_url, type: "image" },
    });

    await cat.save();
    res.json({ success: true, message: "Shop category added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to add category" });
  }
};

// LIST
export const getShopCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch categories" });
  }
};

// DELETE
export const deleteShopCategory = async (req, res) => {
  try {
    const { id } = req.body;
    await ShopCategory.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE
export const updateShopCategory = async (req, res) => {
  try {
    const { id, name, iconType, order, navigateTo } = req.body;

    if (!name) return res.json({ success: false, message: "Name is required" });

    const updateData = {
      name,
      iconType: iconType || "desk",
      order: order ? parseInt(order) : 0,
      navigateTo: navigateTo || "/collections",
    };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "shopCategories",
      });
      fs.unlinkSync(req.file.path);
      updateData.image = { url: uploaded.secure_url, type: "image" };
    }

    await ShopCategory.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Update failed" });
  }
};
