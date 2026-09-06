import { v2 as cloudinary } from "cloudinary";
import catagereModel from "../models/catagereModel.js";

// ADD
export const addcatagere = async (req, res) => {
  try {
    const { name } = req.body;
    const media = req.file;

    if (!media) return res.json({ success: false, message: "Media file required" });

    const result = await cloudinary.uploader.upload(media.path, {
      resource_type: "auto",
    });

    const catagereData = {
      name,
      image: [result.secure_url],
      date: Date.now(),
    };

    const newCatagere = new catagereModel(catagereData);
    await newCatagere.save();

    res.json({ success: true, message: "Media added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// REMOVE
export const removecatagere = async (req, res) => {
  try {
    const { id } = req.body;
    await catagereModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Category removed" })
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// SINGLE
export const singlecatagere = async (req, res) => {
  try {
    const { id } = req.body;
    const item = await catagereModel.findById(id);
    res.json({ success: true, catagere: item });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// LIST
export const listcatagere = async (req, res) => {
  try {
    const items = await catagereModel.find().sort({ createdAt: -1 });
    res.json({ success: true, catageres: items });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
