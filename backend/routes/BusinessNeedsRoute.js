import express from "express";
import multer from "multer";
import {
  addBusinessNeed,
  getBusinessNeeds,
  deleteBusinessNeed,
  updateBusinessNeed,
} from "../controllers/BusinessNeedsController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("media"), addBusinessNeed);
router.get("/list", getBusinessNeeds);
router.post("/delete", deleteBusinessNeed);
router.post("/update", upload.single("media"), updateBusinessNeed);

export default router;
