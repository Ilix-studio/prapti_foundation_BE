import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import BlogPost from "../models/blogPostModel"; // Assuming you have this model
import logger from "../utils/logger";
import { error } from "console";
import cloudinary from "../config/cloudinaryConfig";

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
 * @desc    Create new blog post with Cloudinary image
 * @route   POST /api/blogs/
 * @access  Private (Admin only)
 */
const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, imageUrl, imagePublicId, author } =
    req.body;

  // Validate required fields
  if (!title || !content) {
    res.status(400);
    throw new Error("Please provide title and content");
  }

  try {
    // Create blog post with Cloudinary image
    const blogPost = await BlogPost.create({
      title,
      content,
      excerpt: excerpt || title.substring(0, 100) + "...",
      category,
      imageUrl: imageUrl || "/placeholder.svg?height=450&width=800",
      imagePublicId: imagePublicId || "",
      author: author || req.user?.name || "Admin",
    });

    res.status(201).json({
      success: true,
      data: blogPost,
    });
  } catch (error: any) {
    logger.error(`Error creating blog post: ${error.message}`);
    res.status(500);
    throw new Error(`Error creating blog post: ${error.message}`);
  }
});

/**
 * @desc    Update blog post with Cloudinary image
 * @route   PUT /api/blogs/:id
 * @access  Private (Admin only)
 */
const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  // Find the blog post
  let blogPost = await BlogPost.findById(req.params.id);

  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  try {
    // If a new image was uploaded and there's an old image to delete
    if (
      req.body.imagePublicId &&
      blogPost.imagePublicId &&
      req.body.imagePublicId !== blogPost.imagePublicId
    ) {
      // Delete the old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(blogPost.imagePublicId);
        logger.info(`Deleted old blog image: ${blogPost.imagePublicId}`);
      } catch (error) {
        logger.error(`Failed to delete old blog image: ${error}`);
        // Continue with the update even if image deletion fails
      }
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
  } catch (error: any) {
    logger.error(`Error updating blog post: ${error.message}`);
    res.status(500);
    throw new Error(`Error updating blog post: ${error.message}`);
  }
});

/**
 * @desc    Delete blog post and its Cloudinary image
 * @route   DELETE /api/blogs/:id
 * @access  Private (Admin only)
 */
const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const blogPost = await BlogPost.findById(req.params.id);

  if (!blogPost) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  try {
    // Delete the associated image from Cloudinary if it exists
    if (blogPost.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(blogPost.imagePublicId);
        logger.info(`Deleted blog image: ${blogPost.imagePublicId}`);
      } catch (error) {
        logger.error(`Failed to delete blog image: ${error}`);
        // Continue with the deletion even if image deletion fails
      }
    }

    // Delete the blog post
    await blogPost.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    logger.error(`Error deleting blog post: ${error.message}`);
    res.status(500);
    throw new Error(`Error deleting blog post: ${error.message}`);
  }
});

export {
  getBlogPost,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
};
