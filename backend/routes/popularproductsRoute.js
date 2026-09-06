import express from "express";
import multer from "multer";
import {
  addPopularProduct,
  updatePopularProduct,
  removePopularProduct,
  singlePopularProduct,
  listPopularProducts
} from "../controllers/popularproductsController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // temp folder for Cloudinary

router.post("/add", upload.single("media"), addPopularProduct);
router.put("/update/:id", upload.single("media"), updatePopularProduct);
router.post("/remove", removePopularProduct);
router.post("/single", singlePopularProduct);
router.get("/list", listPopularProducts);

export default router;
