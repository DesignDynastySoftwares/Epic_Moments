import express from "express";
import multer from "multer";
import {
  addDeskDecorative,
  getDeskDecoratives,
  deleteDeskDecorative,
  updateDeskDecorative,
} from "../controllers/DeskDecorativesController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("media"), addDeskDecorative);
router.get("/list", getDeskDecoratives);
router.post("/delete", deleteDeskDecorative);
router.post("/update", upload.single("media"), updateDeskDecorative);

export default router;
