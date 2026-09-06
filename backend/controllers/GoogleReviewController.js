import GoogleReview from "../models/GoogleReviewModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Add a new review
export const addGoogleReview = async (req, res) => {
  try {
    const { name, rating, review } = req.body;
    if (!name || !rating || !review)
      return res.json({ success: false, message: "All fields are required" });

    let mediaData = null;

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "google_reviews",
      });

      mediaData = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
        filename: uploaded.public_id,
      };

      fs.unlinkSync(req.file.path);
    }

    const newReview = new GoogleReview({ name, rating, review, media: mediaData });
    await newReview.save();

    res.json({ success: true, message: "Review added" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to add review" });
  }
};

// Get all reviews
export const getGoogleReviews = async (req, res) => {
  try {
    const reviews = await GoogleReview.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch {
    res.json({ success: false, message: "Failed to fetch reviews" });
  }
};

// Delete a review
export const deleteGoogleReview = async (req, res) => {
  try {
    const { id } = req.body;
    const review = await GoogleReview.findById(id);

    if (review?.media?.filename) {
      await cloudinary.uploader.destroy(review.media.filename, { resource_type: "auto" });
    }

    await GoogleReview.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Delete failed" });
  }
};

// Update a review
export const updateGoogleReview = async (req, res) => {
  try {
    const { id, name, rating, review } = req.body;
    let updateData = { name, rating, review };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "google_reviews",
      });

      updateData.media = {
        url: uploaded.secure_url,
        type: uploaded.resource_type === "video" ? "video" : "image",
        filename: uploaded.public_id,
      };

      fs.unlinkSync(req.file.path);
    }

    await GoogleReview.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Update failed" });
  }
};
