import express from "express";
import {
  createAwardPost,
  delAwardPost,
  getAwardPost,
  getByIdAwardPost,
  updateAwardPost,
  uploadAward,
  uploadMultipleAwards,
} from "../controllers/award.controller";
import { protect } from "../middleware/authMiddleware";
import { handleMulterError, photoUploadConfig } from "../config/multerConfig";
const router = express.Router();

router.post("/create", protect, createAwardPost);
// Single photo upload
router.post(
  "/upload",
  protect,
  photoUploadConfig.single("image"),
  handleMulterError,
  uploadAward
);

// Multiple photos upload
router.post(
  "/upload-multiple",
  protect,
  photoUploadConfig.array("images", 10), // Max 10 photos
  handleMulterError,
  uploadMultipleAwards
);

router.get("/get", getAwardPost);
router.get("/get/:id", getByIdAwardPost);
router.patch("/update/:id", photoUploadConfig.single("image"), updateAwardPost);
router.delete("/del/:id", delAwardPost);

export default router;
