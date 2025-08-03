import express from "express";
import { protect } from "../middleware/authMiddleware";
import { apiLimiter } from "../middleware/rateLimitMiddleware";
import {
  incrementVisitorCount,
  getVisitorCount,
  getVisitorStats,
  resetVisitorCount,
} from "../controllers/visitor.controller";

const router = express.Router();

// Public routes - for visitor tracking
router.post("/increment-counter", apiLimiter, incrementVisitorCount);
router.get("/visitor-count", apiLimiter, getVisitorCount);

// Protected routes (Admin only) - for dashboard analytics
router.use(protect); // All routes below require authentication

// Admin dashboard analytics
router.get("/stats", getVisitorStats);
router.post("/reset", resetVisitorCount);

export default router;
