// src/routes/totalImpact.ts
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { formLimiter } from "../middleware/rateLimitMiddleware";

import {
  getImpactStatistics,
  createTotalImpact,
  getAllTotalImpact,
  getTotalImpactById,
  getLatestTotalImpact,
  updateTotalImpact,
  deleteTotalImpact,
} from "../controllers/impactController";

const router = express.Router();

// Public routes
router.get("/", getAllTotalImpact);
router.get("/latest", getLatestTotalImpact);
router.get("/stats", getImpactStatistics);
router.get("/:id", getTotalImpactById);

// Protected routes (Admin only)
router.post("/", protect, formLimiter, createTotalImpact);
router.put("/:id", protect, updateTotalImpact);
router.delete("/:id", protect, deleteTotalImpact);

export default router;
