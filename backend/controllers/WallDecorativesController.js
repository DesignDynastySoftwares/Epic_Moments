import WallDecorative from "../models/WallDecorativesModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD WALL DECORATIVE
export const addWallDecorative = async (req, res) => {
  try {
    const { name, originalPrice, offerPrice, days, category } = req.body;

    if (!name || !originalPrice) {
      return res.json({ success: false, message: "Name & Original Price required" });
    }

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    if (!req.file)
      return res.json({ success: false, message: "Media file required" });

    // Upload media to Cloudinary
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "walldecor",
    });

    fs.unlinkSync(req.file.path);

    const mediaType = uploaded.resource_type === "video" ? "video" : "image";

    const newItem = new WallDecorative({
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

    res.json({ success: true, message: "Wall decorative added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to add item" });
  }
};

// LIST ALL
export const getWallDecoratives = async (req, res) => {
  try {
    const items = await WallDecorative.find().sort({ createdAt: -1 });
    res.json({ success: true, products: items });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch list" });
  }
};

// DELETE
export const deleteWallDecorative = async (req, res) => {
  try {
    const { id } = req.body;

    await WallDecorative.findByIdAndDelete(id);

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE
export const updateWallDecorative = async (req, res) => {
  try {
    const { id, name, originalPrice, offerPrice, days, category } = req.body;

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    let updateData = {
      name,
      category,
      originalPrice,
      offerPrice: offerPrice || null,
      days: days || null,
    };

    // NEW MEDIA UPDATE
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "walldecor",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
      };

      fs.unlinkSync(req.file.path);
    }

    await WallDecorative.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: "Item updated successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Update failed" });
  }
};

