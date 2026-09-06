import OfferProduct from "../models/OfferProductsModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD OFFER PRODUCT
export const addOfferProduct = async (req, res) => {
  try {
    const { name, originalPrice, offerPrice, days, category, isBestseller, rating, tagline } = req.body;

    if (!name || !originalPrice || !offerPrice) {
      return res.json({
        success: false,
        message: "Name, Original Price & Offer Price are required",
      });
    }

    if (!category) {
      return res.json({
        success: false,
        message: "Category is required",
      });
    }

    if (!req.file)
      return res.json({ success: false, message: "Media file is required" });

    // Upload media
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "offerProducts",
    });

    fs.unlinkSync(req.file.path);

    const mediaType =
      uploaded.resource_type === "video" ? "video" : "image";

    // Save offer product
    const newOffer = new OfferProduct({
      name,
      category,
      originalPrice,
      offerPrice,
      days: days || null,
      media: { url: uploaded.secure_url, type: mediaType },
      isBestseller: isBestseller === "true" || isBestseller === true,
      rating: rating ? parseFloat(rating) : 4.9,
      tagline: tagline || "Personalized with love",
    });

    await newOffer.save();

    res.json({ success: true, message: "Offer product added successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to add product" });
  }
};

// LIST ALL OFFER PRODUCTS
export const getOfferProducts = async (req, res) => {
  try {
    const products = await OfferProduct.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch products" });
  }
};

// DELETE OFFER PRODUCT
export const deleteOfferProduct = async (req, res) => {
  try {
    const { id } = req.body;
    await OfferProduct.findByIdAndDelete(id);
    res.json({ success: true, message: "Offer product deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE OFFER PRODUCT
export const updateOfferProduct = async (req, res) => {
  try {
    const { id, name, originalPrice, offerPrice, days, category, isBestseller, rating, tagline } = req.body;

    if (!category) {
      return res.json({
        success: false,
        message: "Category is required",
      });
    }

    let updateData = {
      name,
      category,
      originalPrice,
      offerPrice,
      days: days || null,
      isBestseller: isBestseller === "true" || isBestseller === true,
      rating: rating ? parseFloat(rating) : 4.9,
      tagline: tagline || "Personalized with love",
    };

    // Handle new media upload
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "offerProducts",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
      };

      fs.unlinkSync(req.file.path);
    }

    await OfferProduct.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: "Offer product updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Update failed" });
  }
};
