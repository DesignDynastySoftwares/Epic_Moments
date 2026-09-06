import mongoose from "mongoose";

const popularProductsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    image: { type: [String], required: true },
    category: { type: String, required: true },

    // Display fields (admin-controlled)
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },   // number of ratings/reviews
    purchases: { type: Number, default: 0 },     // number of purchases

    date: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("popularproducts", popularProductsSchema);
