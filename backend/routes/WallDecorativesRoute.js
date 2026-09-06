import express from "express";
import multer from "multer";

import {
  addWallDecorative,
  getWallDecoratives,
  deleteWallDecorative,
  updateWallDecorative,
} from "../controllers/WallDecorativesController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("media"), addWallDecorative);
router.get("/list", getWallDecoratives);
router.post("/delete", deleteWallDecorative);
router.post("/update", upload.single("media"), updateWallDecorative);

export default router;
