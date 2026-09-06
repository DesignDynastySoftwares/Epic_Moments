import express from "express";
import {
  getOfferBanner,
  saveOfferBanner,
} from "../controllers/offerBannerController.js";

const router = express.Router();

router.get("/get", getOfferBanner);
// Accepts JSON (image elements carry base64 in `newImageData`).
router.post("/save", saveOfferBanner);

export default router;
