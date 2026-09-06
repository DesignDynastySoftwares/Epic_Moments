import { v2 as cloudinary } from "cloudinary";
import popularproductsModel from "../models/popularproductsModel.js";

// ADD Popular Product
export const addPopularProduct = async (req, res) => {
  try {
    const { name, category, rating, ratingCount, purchases } = req.body;
    const media = req.file;

    if (!media) {
      return res.json({ success: false, message: "Media file required" });
    }

    if (!category) {
      return res.json({ success: false, message: "Category is required" });
    }

    const upload = await cloudinary.uploader.upload(media.path, {
      resource_type: "auto",
    });

    const popularProductData = {
      name,
      category,
      image: [upload.secure_url],
      rating: rating ? parseFloat(rating) : 4.8,
      ratingCount: ratingCount ? parseInt(ratingCount, 10) : 0,
      purchases: purchases ? parseInt(purchases, 10) : 0,
      date: Date.now(),
    };

    const newPopularProduct = new popularproductsModel(popularProductData);
    await newPopularProduct.save();

    res.json({ success: true, message: "Popular product added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// UPDATE Popular Product
export const updatePopularProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, rating, ratingCount, purchases } = req.body;

    const item = await popularproductsModel.findById(id);
    if (!item) {
      return res.json({ success: false, message: "Popular product not found" });
    }

    // Replace image only if a new file is uploaded
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      item.image = [upload.secure_url];
    }

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (rating !== undefined) item.rating = rating ? parseFloat(rating) : item.rating;
    if (ratingCount !== undefined)
      item.ratingCount = ratingCount ? parseInt(ratingCount, 10) : 0;
    if (purchases !== undefined)
      item.purchases = purchases ? parseInt(purchases, 10) : 0;

    await item.save();

    res.json({ success: true, message: "Popular product updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// REMOVE Popular Product
export const removePopularProduct = async (req, res) => {
  try {
    const { id } = req.body;

    await popularproductsModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Popular product removed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// GET SINGLE PRODUCT
export const singlePopularProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const item = await popularproductsModel.findById(id);

    res.json({ success: true, popularProduct: item });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// LIST ALL
export const listPopularProducts = async (req, res) => {
  try {
    const items = await popularproductsModel.find().sort({ createdAt: -1 });

    res.json({ success: true, popularProducts: items });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
