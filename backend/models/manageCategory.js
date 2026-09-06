import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,  // Ensure names like "Books" and "books" are treated the same
    trim: true
  }
}, { timestamps: true });

export const manageCategory = mongoose.model("Category", categorySchema);
