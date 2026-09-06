import mongoose from "mongoose";

const ShopCategorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    image:     { url: String, type: { type: String, default: "image" } },
    iconType:  { type: String, default: "desk" }, // desk | wedding | gift | album | photo | wall | car | business | custom
    order:     { type: Number, default: 0 },       // display order
    navigateTo: { type: String, default: "/collections" }, // where card click goes
  },
  { timestamps: true }
);

export default mongoose.model("ShopCategory", ShopCategorySchema);
