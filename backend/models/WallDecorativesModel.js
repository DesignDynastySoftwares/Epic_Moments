import mongoose from "mongoose";

const WallDecorativeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    media: {
      url: String,
      type: { type: String, enum: ["image", "video", "gif"], default: "image" },
    },

    originalPrice: { type: Number, required: true },

    offerPrice: { type: Number, default: null },

    days: { type: Number, default: null },

    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WallDecorative", WallDecorativeSchema);

