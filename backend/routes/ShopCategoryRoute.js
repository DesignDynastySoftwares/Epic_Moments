import express from "express";
import multer from "multer";
import {
  addShopCategory,
  getShopCategories,
  deleteShopCategory,
  updateShopCategory,
} from "../controllers/ShopCategoryController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add",    upload.single("image"), addShopCategory);
router.get("/list",    getShopCategories);
router.post("/delete", deleteShopCategory);
router.post("/update", upload.single("image"), updateShopCategory);

export default router;
