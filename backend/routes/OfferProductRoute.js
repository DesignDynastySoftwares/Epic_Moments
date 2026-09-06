import express from "express";
import multer from "multer";
import {
  addOfferProduct,
  updateOfferProduct,
  getOfferProducts,
  deleteOfferProduct,
} from "../controllers/OfferProductController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("media"), addOfferProduct);
router.get("/list", getOfferProducts);
router.post("/delete", deleteOfferProduct);
router.post("/update", upload.single("media"), updateOfferProduct);

export default router;
