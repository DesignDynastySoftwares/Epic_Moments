import express from "express";
import multer from "multer";

import {
  addCarDecorative,
  getCarDecoratives,
  deleteCarDecorative,
  updateCarDecorative,
} from "../controllers/CarDecorativesController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("media"), addCarDecorative);
router.get("/list", getCarDecoratives);
router.post("/delete", deleteCarDecorative);
router.post("/update", upload.single("media"), updateCarDecorative);

export default router;
