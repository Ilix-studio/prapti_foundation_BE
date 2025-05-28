// controllers/blogs.controller.ts
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger";
import cloudinary from "../config/cloudinaryConfig";
import BlogPostModel from "../models/blogModel";

/**
 * @desc    Get all blog posts
 * @route   GET /api/blogs
 * @access  Public
 */
export const getBlogPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogs = await BlogPostModel.find({}).sort({ createdAt: -1 });

      res.status(200).json(blogs);
    } catch (error: any) {
      logger.error("Error fetching blog posts:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching blog posts",
        error: error.message,
      });
    }
  }
);

/**
 * @desc    Get single blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
export const getBlogPostById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Blog ID is required",
        });
        return;
      }

      const blog = await BlogPostModel.findById(id);

      if (!blog) {
        res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
        return;
      }

      res.status(200).json(blog);
    } catch (error: any) {
      logger.error("Error fetching blog post:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching blog post",
        error: error.message,
      });
    }
  }
);

/**
 * @desc    Create new blog post
 * @route   POST /api/blogs/create
 * @access  Private (Admin only)
 */
export const createBlogPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, excerpt, content, category, image } = req.body;

      // Validation
      if (!title || !excerpt || !content || !category) {
        res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
        return;
      }

      // Create blog post
      const blog = await BlogPostModel.create({
        title,
        excerpt,
        content,
        category,
        image: image || "",
        author: req.user?.name || "Prapti Foundation",
      });

      logger.info(`New blog post created: ${blog.title} by ${req.user?.email}`);

      res.status(201).json({
        success: true,
        message: "Blog post created successfully",
        data: blog,
      });
    } catch (error: any) {
      logger.error("Error creating blog post:", error);
      res.status(500).json({
        success: false,
        message: "Error creating blog post",
        error: error.message,
      });
    }
  }
);

/**
 * @desc    Update blog post
 * @route   PUT /api/blogs/update/:id
 * @access  Private (Admin only)
 */
export const updateBlogPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, excerpt, content, category, image } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Blog ID is required",
        });
        return;
      }

      // Find blog post
      const blog = await BlogPostModel.findById(id);

      if (!blog) {
        res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
        return;
      }

      // Update fields
      blog.title = title || blog.title;
      blog.excerpt = excerpt || blog.excerpt;
      blog.content = content || blog.content;
      blog.category = category || blog.category;
      blog.image = image || blog.image;

      await blog.save();

      logger.info(`Blog post updated: ${blog.title} by ${req.user?.email}`);

      res.status(200).json({
        success: true,
        message: "Blog post updated successfully",
        data: blog,
      });
    } catch (error: any) {
      logger.error("Error updating blog post:", error);
      res.status(500).json({
        success: false,
        message: "Error updating blog post",
        error: error.message,
      });
    }
  }
);

/**
 * @desc    Delete blog post
 * @route   DELETE /api/blogs/delete/:id
 * @access  Private (Admin only)
 */
export const deleteBlogPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Blog ID is required",
        });
        return;
      }

      const blog = await BlogPostModel.findById(id);

      if (!blog) {
        res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
        return;
      }

      // Extract public ID from Cloudinary URL if it's a Cloudinary image
      if (blog.image && blog.image.includes("cloudinary.com")) {
        try {
          const urlParts = blog.image.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
            // Get everything after 'upload/v{version}/'
            const publicIdWithExtension = urlParts
              .slice(uploadIndex + 2)
              .join("/");
            // Remove file extension
            const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

            // Delete from Cloudinary
            const deleteResult = await cloudinary.uploader.destroy(publicId);
            logger.info(
              `Deleted image from Cloudinary: ${publicId}, result: ${deleteResult.result}`
            );
          }
        } catch (cloudinaryError) {
          // Log error but don't fail the blog deletion
          logger.error(
            `Failed to delete image from Cloudinary: ${cloudinaryError}`
          );
        }
      }

      await BlogPostModel.findByIdAndDelete(id);

      logger.info(`Blog post deleted: ${blog.title} by ${req.user?.email}`);

      res.status(200).json({
        success: true,
        message: "Blog post deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting blog post:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting blog post",
        error: error.message,
      });
    }
  }
);
