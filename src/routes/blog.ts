import express from "express";
import {
  createBlogPost,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostById,
} from "../controllers/blogs.controller";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getBlogPost);
router.get("/:id", getBlogPostById);
router.post("/create", protect, createBlogPost);
router.put("/update/:id", protect, updateBlogPost);
router.delete("/delete/:id", protect, deleteBlogPost);

export default router;
