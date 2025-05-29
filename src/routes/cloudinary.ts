// src/routes/cloudinary.ts
import express from "express";

import { protect } from "../middleware/authMiddleware";
import {
  deleteCloudinaryImage,
  generateSignature,
} from "../controllers/cloudinaryController";

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.post("/signature", generateSignature);
router.delete("/:publicId", deleteCloudinaryImage);

export default router;
