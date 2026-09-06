import express from "express";
import {
  submitEnquiry,
  getAllEnquiries,
} from "../controllers/enquiryController.js";

const router = express.Router();

// Public
router.post("/", submitEnquiry);
router.get("/", getAllEnquiries);

export default router;
