import CarDecorative from "../models/CarDecorativesModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD
export const addCarDecorative = async (req, res) => {
  try {
    const { name, originalPrice, offerPrice, days, category } = req.body;

    if (!name || !originalPrice)
      return res.json({ success: false, message: "Name & Price required" });

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    if (!req.file)
      return res.json({ success: false, message: "Media file required" });

    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "cardecor",
    });

    fs.unlinkSync(req.file.path);

    const mediaType = uploaded.resource_type === "video" ? "video" : "image";

    const newItem = new CarDecorative({
      name,
      category,
      originalPrice,
      offerPrice: offerPrice || null,
      days: days || null,
      media: {
        url: uploaded.secure_url,
        type: mediaType,
      },
    });

    await newItem.save();

    res.json({ success: true, message: "Car decorative added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to add item" });
  }
};

// LIST
export const getCarDecoratives = async (req, res) => {
  try {
    const items = await CarDecorative.find().sort({ createdAt: -1 });
    res.json({ success: true, products: items });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to fetch list" });
  }
};

// DELETE
export const deleteCarDecorative = async (req, res) => {
  try {
    const { id } = req.body;
    await CarDecorative.findByIdAndDelete(id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE
export const updateCarDecorative = async (req, res) => {
  try {
    const { id, name, originalPrice, offerPrice, days, category } = req.body;

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    let updateData = {
      name,
      originalPrice,
      offerPrice: offerPrice || null,
      days: days || null,
      category,
    };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "cardecor",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
      };

      fs.unlinkSync(req.file.path);
    }

    await CarDecorative.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "Item updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Update failed" });
  }
};
