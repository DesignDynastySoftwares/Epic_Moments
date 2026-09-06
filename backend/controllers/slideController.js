import { v2 as cloudinary } from "cloudinary";
import slideModel from "../models/slideModel.js";
import fs from "fs";

// ADD Slide
export const addslide = async (req, res) => {
  try {
    const { name } = req.body;
    const media = req.file;

    if (!media) return res.json({ success: false, message: "Media file required" });

    const result = await cloudinary.uploader.upload(media.path, {
      resource_type: "auto",
    });

    const newSlide = new slideModel({
      name,
      image: [result.secure_url],
      public_ids: [result.public_id],
      resource_types: [result.resource_type],
    });

    await newSlide.save();

    fs.unlinkSync(media.path); // clean up local file

    res.json({ success: true, message: "Media added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// LIST Slides
export const listslide = async (req, res) => {
  try {
    const items = await slideModel.find().sort({ createdAt: -1 });
    res.json({ success: true, slides: items });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// REMOVE Slide
export const removeslide = async (req, res) => {
  try {
    const { id } = req.body;
    const slide = await slideModel.findById(id);
    if (!slide) return res.json({ success: false, message: "Slide not found" });

    for (let i = 0; i < slide.public_ids.length; i++) {
      await cloudinary.uploader.destroy(slide.public_ids[i], {
        resource_type: slide.resource_types[i],
      });
    }

    await slideModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Slide removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
