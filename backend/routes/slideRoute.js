import express from "express";
import multer from "multer";
import {
  addslide,
  listslide,
  removeslide,
} from "../controllers/slideController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp local storage

// ❌ Admin auth removed – public routes
router.post("/add", upload.single("media"), addslide);
router.post("/remove", removeslide);
router.get("/list", listslide);

export default router;
