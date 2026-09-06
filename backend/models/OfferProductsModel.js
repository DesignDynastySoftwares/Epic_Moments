import mongoose from "mongoose";

const OfferProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    media: {
      url: String,
      type: { type: String, enum: ["image", "video"], default: "image" },
    },

    originalPrice: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    days: { type: Number },

    category: { type: String, required: true },

    // NEW: for card UI
    isBestseller: { type: Boolean, default: false },
    rating: { type: Number, default: 4.9, min: 0, max: 5 },
    tagline: { type: String, default: "Personalized with love" },
  },
  { timestamps: true }
);

export default mongoose.model("OfferProduct", OfferProductSchema);
