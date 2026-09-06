// import mongoose from "mongoose";

// const slideSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   image: { type: [String], required: true },
//   public_ids: { type: [String], required: true },
// }, { timestamps: true });

// export default mongoose.model("Slide", slideSchema);
// models/slideModel.js
// models/slideModel.js
// import mongoose from "mongoose";

// const slideSchema = new mongoose.Schema(
//   {
//     name: String,
//     image: [String],
//     public_ids: [String],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Slide", slideSchema);

import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: [String], required: true }, // URLs
    public_ids: { type: [String], required: true }, // Cloudinary public IDs
    resource_types: { type: [String], required: true }, // image, video, etc.
  },
  { timestamps: true }
);

export default mongoose.model("slide", slideSchema);
