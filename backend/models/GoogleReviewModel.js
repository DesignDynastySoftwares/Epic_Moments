import mongoose from "mongoose";

const GoogleReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    media: {
      url: String, // Cloudinary media URL
      type: { type: String, enum: ["image", "video", "gif"], default: "image" },
      filename: String, // Cloudinary public_id
    },
  },
  { timestamps: true }
);

export default mongoose.model("GoogleReview", GoogleReviewSchema);
