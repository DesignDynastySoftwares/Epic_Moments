import BusinessNeed from "../models/BusinessNeedsModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ADD BUSINESS NEED
export const addBusinessNeed = async (req, res) => {
  try {
    const { name, startingPrice, category } = req.body;

    if (!name) return res.json({ success: false, message: "Name required" });
    if (!category)
      return res.json({ success: false, message: "Category required" });

    if (!req.file)
      return res.json({ success: false, message: "Media file required" });

    // Upload media
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "business_needs",
    });

    fs.unlinkSync(req.file.path);

    const mediaType = uploaded.resource_type === "video" ? "video" : "image";

    const newItem = new BusinessNeed({
      name,
      category,
      startingPrice: startingPrice || null,
      media: {
        url: uploaded.secure_url,
        type: mediaType,
      },
    });

    await newItem.save();

    res.json({ success: true, message: "Business Need added" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to add item" });
  }
};

// LIST ALL
export const getBusinessNeeds = async (req, res) => {
  try {
    const items = await BusinessNeed.find().sort({ createdAt: -1 });
    res.json({ success: true, products: items });
  } catch {
    res.json({ success: false, message: "Failed to fetch list" });
  }
};

// DELETE
export const deleteBusinessNeed = async (req, res) => {
  try {
    const { id } = req.body;

    await BusinessNeed.findByIdAndDelete(id);

    res.json({ success: true, message: "Deleted successfully" });
  } catch {
    res.json({ success: false, message: "Delete failed" });
  }
};

// UPDATE
export const updateBusinessNeed = async (req, res) => {
  try {
    const { id, name, category, startingPrice } = req.body;

    if (!category)
      return res.json({ success: false, message: "Category is required" });

    let updateData = {
      name,
      category,
      startingPrice: startingPrice || null,
    };

    // If new media uploaded
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "business_needs",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
      };

      fs.unlinkSync(req.file.path);
    }

    await BusinessNeed.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Update failed" });
  }
};
