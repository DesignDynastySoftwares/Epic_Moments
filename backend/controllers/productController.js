import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Helper: get Cloudinary resource type from mimetype
const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "raw"; // audio files use raw in Cloudinary
  return "auto";
};

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sizes,
      bestseller,
      rating,
      customers,
    } = req.body;

    // Your multer field names expected: media1, media2, media3, media4
    const mediaFiles = [
      req.files.media1?.[0],
      req.files.media2?.[0],
      req.files.media3?.[0],
      req.files.media4?.[0],
    ].filter(Boolean);

    // Upload all media files with proper resource_type
    const media = await Promise.all(
      mediaFiles.map(async (file) => {
        const resourceType = getResourceType(file.mimetype);
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: resourceType,
        });
        return {
          url: result.secure_url,
          type: resourceType === "raw" ? "audio" : resourceType,
          public_id: result.public_id,
        };
      })
    );

    // Extract reviews from req.body like before
    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const reviewer = req.body[`reviews[${i}][reviewer]`];
      const comment = req.body[`reviews[${i}][comment]`];
      const revRating = req.body[`reviews[${i}][rating]`];

      if (reviewer && comment && revRating !== undefined) {
        reviews.push({
          reviewer,
          comment,
          rating: Number(revRating),
        });
      } else {
        break;
      }
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      bestseller: bestseller === "true" || bestseller === true,
      sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes || [],
      media, // changed from `image` to `media` to reflect mixed media
      rating: Number(rating),
      customers: Number(customers),
      reviews,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    await productModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Single product
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update full product (edit)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      category,
      sizes,
      bestseller,
      rating,
      customers,
      keepMedia, // JSON string array of existing media objects to keep
    } = req.body;

    // 1) Start from the media the admin chose to keep
    let media = [];
    if (keepMedia) {
      try {
        media = typeof keepMedia === "string" ? JSON.parse(keepMedia) : keepMedia;
      } catch {
        media = [];
      }
    }

    // Figure out which existing media were removed, so we can delete them from Cloudinary
    const keptIds = new Set(media.map((m) => m.public_id).filter(Boolean));
    const removedMedia = (product.media || []).filter(
      (m) => m.public_id && !keptIds.has(m.public_id)
    );

    // 2) Upload any newly added media files (media1..media4)
    const newFiles = [
      req.files?.media1?.[0],
      req.files?.media2?.[0],
      req.files?.media3?.[0],
      req.files?.media4?.[0],
    ].filter(Boolean);

    if (newFiles.length > 0) {
      const uploaded = await Promise.all(
        newFiles.map(async (file) => {
          const resourceType = getResourceType(file.mimetype);
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: resourceType,
          });
          return {
            url: result.secure_url,
            type: resourceType === "raw" ? "audio" : resourceType,
            public_id: result.public_id,
          };
        })
      );
      media = [...media, ...uploaded];
    }

    if (media.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Product must have at least one media file" });
    }

    // 3) Delete removed media from Cloudinary (best-effort)
    await Promise.all(
      removedMedia.map(async (m) => {
        try {
          const resourceType = m.type === "audio" ? "raw" : m.type;
          await cloudinary.uploader.destroy(m.public_id, { resource_type: resourceType });
        } catch (e) {
          console.log("Cloudinary destroy failed:", e.message);
        }
      })
    );

    // 4) Apply field updates (only when provided)
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (sizes !== undefined) {
      product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes || [];
    }
    if (bestseller !== undefined) {
      product.bestseller = bestseller === "true" || bestseller === true;
    }
    if (rating !== undefined) product.rating = Number(rating);
    if (customers !== undefined) product.customers = Number(customers);
    product.media = media;

    await product.save();

    res.json({ success: true, message: "Product Updated", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reviews
const updateProductReviews = async (req, res) => {
  try {
    const { reviews } = req.body;
    const { id } = req.params;

    if (!Array.isArray(reviews)) {
      return res.status(400).json({ success: false, message: "Invalid reviews format" });
    }

    const product = await productModel.findByIdAndUpdate(
      id,
      { reviews },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Reviews updated", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  updateProduct,
  updateProductReviews,
};
