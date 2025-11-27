import express from "express";
import {
  createRescuePost,
  delRescuePost,
  getByIdRescuePost,
  getRescuePost,
  updateRescuePost,
} from "../controllers/rescue.controller";
import { protect } from "../middleware/authMiddleware";
import { handleMulterError, photoUploadConfig } from "../config/multerConfig";

const router = express.Router();

// Public routes
router.get("/get", getRescuePost);
router.get("/get/:id", getByIdRescuePost);

// Protected routes (admin only)
router.post(
  "/create",
  protect,
  photoUploadConfig.fields([
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
  ]),
  handleMulterError,
  createRescuePost
);
router.patch(
  "/update/:id",
  protect,
  photoUploadConfig.single("image"),
  handleMulterError,
  updateRescuePost
);
router.delete("/del/:id", protect, delRescuePost);

export default router;
