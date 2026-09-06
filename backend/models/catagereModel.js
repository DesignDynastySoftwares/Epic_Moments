
import mongoose from "mongoose";

const catagereSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: [String] }, // supports multiple images if needed
  },
  { timestamps: true }
);

const CatagereModel = mongoose.model("catagere", catagereSchema);
export default CatagereModel;
