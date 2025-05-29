// routes/blog.ts
import express from "express";

import { protect } from "../middleware/authMiddleware";

import {
  validateBlogCreate,
  validateBlogUpdate,
  validateBlogId,
} from "./../middleware/validationMiddleware";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "../controllers/blogs.controller";

const router = express.Router();

// Public routes
router.get("/getAll", getBlogPost);
router.get("/:id", validateBlogId, getBlogPostById);

// Protected routes (admin only) with rate limiting and validation
router.post("/create", protect, validateBlogCreate, createBlogPost);

router.put("/update/:id", protect, validateBlogUpdate, updateBlogPost);

router.delete("/delete/:id", protect, validateBlogId, deleteBlogPost);

export default router;
