import mongoose from "mongoose";

const BusinessNeedsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    media: {
      url: String,
      type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    },

    startingPrice: { type: Number, default: null },

    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("BusinessNeed", BusinessNeedsSchema);
