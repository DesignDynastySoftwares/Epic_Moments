import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewer: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
});

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "audio"], required: true },
  public_id: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  media: { type: [mediaSchema], required: true },
  category: { type: String, required: true },
  sizes: { type: [String], required: true },
  bestseller: { type: Boolean, default: false },
  rating: { type: Number, default: 4 },
  customers: { type: Number, default: 0 },
  date: { type: Number, required: true },
  reviews: [reviewSchema],
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
