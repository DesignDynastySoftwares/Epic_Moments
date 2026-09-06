import DeskDecorative from "../models/DeskDecorativesModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD DESK DECORATIVE
export const addDeskDecorative = async (req, res) => {
  try {
    const { name, originalPrice, offerPrice, days, category } = req.body;

    if (!name || !originalPrice) {
      return res.json({
        success: false,
        message: "Name & Original Price are required",
      });
    }

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    if (!req.file)
      return res.json({ success: false, message: "Media file is required" });

    // Upload media
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "deskdecor",
    });

    fs.unlinkSync(req.file.path);

    const mediaType =
      uploaded.resource_type === "video" ? "video" : "image";

    const newItem = new DeskDecorative({
      name,
      category,
      originalPrice,
      offerPrice: offerPrice || null, // OPTIONAL
      days: days || null,
      media: {
        url: uploaded.secure_url,
        type: mediaType,
      },
    });

    await newItem.save();

    res.json({ success: true, message: "Desk decorative added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to add item" });
  }
};

// LIST ALL
export const getDeskDecoratives = async (req, res) => {
  try {
    const items = await DeskDecorative.find().sort({ createdAt: -1 });
    res.json({ success: true, products: items });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch list" });
  }
};

// DELETE
export const deleteDeskDecorative = async (req, res) => {
  try {
    const { id } = req.body;
    await DeskDecorative.findByIdAndDelete(id);

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE
export const updateDeskDecorative = async (req, res) => {
  try {
    const { id, name, originalPrice, offerPrice, days, category } = req.body;

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    let updateData = {
      name,
      category,
      originalPrice,
      offerPrice: offerPrice || null, // OPTIONAL
      days: days || null,
    };

    // NEW MEDIA UPLOAD
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "deskdecor",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
      };

      fs.unlinkSync(req.file.path);
    }

    await DeskDecorative.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: "Item updated successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Update failed" });
  }
};
