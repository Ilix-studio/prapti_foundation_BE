import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import BlogPost from "../models/blogPostModel"; // Assuming you have this model
import logger from "../utils/logger";
import { error } from "console";

/**
 * @desc    Create new blog post
 * @route   POST /api/blogs/
 * @access  Private (Admin only)
 */
const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, image } = req.body;

  // Validate required fields
  if (!title || !content) {
    res.status(400);
    throw new Error("Please provide title and content");
  }

  // Create blog post
  const blogPost = await BlogPost.create({
    title,
    content,
    excerpt: excerpt || title.substring(0, 100) + "...",
    category,
    image,
    author: req.body.author || "Admin",
  });
  res.status(201).json({
    success: true,
    data: blogPost,
  });
  if (!blogPost) {
    logger.error(
      `Error creating blog post: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    if (res.statusCode === 200) res.status(500);
    throw new Error(
      error instanceof Error ? error.message : "Error creating blog post"
    );
  }
});

/**
 * @desc    Get all blog posts
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const blogPosts = await BlogPost.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: blogPosts.length,
    data: blogPosts,
  });
  if (!blogPosts) {
    logger.error(
      `Error fetching blog posts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    res.status(500);
    throw new Error("Error fetching blog posts");
  }
});

/**
 * @desc    Get single blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogPostById = asyncHandler(async (req: Request, res: Response) => {
  const blogPost = await BlogPost.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: blogPost,
  });
  if (!blogPost) {
    logger.error(
      `Error fetching blog post: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    if (res.statusCode === 200) res.status(500);
    throw new Error(
      error instanceof Error ? error.message : "Error fetching blog post"
    );
  }
});

/**
 * @desc    Update blog post
 * @route   PUT /api/blogs/:id
 * @access  Private (Admin only)
 */
const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  let blogPost = await BlogPost.findById(req.params.id);

  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  // Update blog post
  blogPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: blogPost,
  });
  if (!blogPost) {
    logger.error(
      `Error updating blog post: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    if (res.statusCode === 200) res.status(500);
    throw new Error(
      error instanceof Error ? error.message : "Error updating blog post"
    );
  }
});

/**
 * @desc    Delete blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private (Admin only)
 */
const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const blogPost = await BlogPost.findById(req.params.id);

  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  await blogPost.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

export {
  createBlogPost,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostById,
};
