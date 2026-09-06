import express from "express";
import multer from "multer";
import {
  addGoogleReview,
  getGoogleReviews,
  deleteGoogleReview,
  updateGoogleReview,
} from "../controllers/GoogleReviewController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary upload folder

// Add review with optional media
router.post("/add", upload.single("media"), addGoogleReview);

// Get all reviews
router.get("/list", getGoogleReviews);

// Delete review
router.post("/delete", deleteGoogleReview);

// Update review with optional new media
router.post("/update", upload.single("media"), updateGoogleReview);

export default router;
