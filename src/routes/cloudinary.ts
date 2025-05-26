// src/routes/cloudinary.ts
import express from "express";
import {
  generateSignature,
  deleteCloudinaryImage,
} from "../controllers/cloudinaryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.post("/signature", generateSignature);
router.delete("/:publicId", deleteCloudinaryImage);

export default router;
