"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPost = exports.updateBlogPost = exports.createBlogPost = exports.getBlogPostById = exports.getBlogPost = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get all blog posts
 * @route   GET /api/blogs
 * @access  Public
 */
exports.getBlogPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const blogs = await blogModel_1.default.find({})
            .populate("category", "name type")
            .sort({ createdAt: -1 });
        res.status(200).json(blogs);
    }
    catch (error) {
        logger_1.default.error("Error fetching blog posts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching blog posts",
            error: error.message,
        });
    }
});
/**
 * @desc    Get single blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
exports.getBlogPostById = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
            return;
        }
        const blog = await blogModel_1.default.findById(id).populate("category", "name type");
        if (!blog) {
            res.status(404).json({
                success: false,
                message: "Blog post not found",
            });
            return;
        }
        res.status(200).json(blog);
    }
    catch (error) {
        logger_1.default.error("Error fetching blog post:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching blog post",
            error: error.message,
        });
    }
});
/**
 * @desc    Create new blog post
 * @route   POST /api/blogs/create
 * @access  Private (Admin only)
 */
exports.createBlogPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b;
    try {
        const { title, content, category, image } = req.body;
        // Validation
        if (!title || !content || !category) {
            res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
            return;
        }
        // Debug logging
        console.log("Received category value:", category, typeof category);
        // Validate category exists and is type "blogs"
        if (!category || typeof category !== "string") {
            res.status(400);
            throw new Error("Category is required and must be a string");
        }
        // Try to find by ObjectId first, if that fails, try by name
        let categoryDoc;
        let categoryId = category; // Use a separate variable for the actual ID
        try {
            // First attempt: find by ObjectId
            const CategoryModel = require("../models/categoryModel").default;
            categoryDoc = await CategoryModel.findOne({
                _id: category,
                type: "blogs",
            });
        }
        catch (error) {
            // If ObjectId cast fails, category might be a name instead of ID
            console.log("ObjectId cast failed, trying to find by name:", category);
        }
        // If not found by ID, try to find by name
        if (!categoryDoc) {
            const CategoryModel = require("../models/categoryModel").default;
            categoryDoc = await CategoryModel.findOne({
                name: category,
                type: "blogs",
            });
            if (categoryDoc) {
                console.log("Found category by name, using ID:", categoryDoc._id);
                // Update the categoryId variable to use the correct ObjectId
                categoryId = categoryDoc._id.toString();
            }
        }
        if (!categoryDoc) {
            res.status(400);
            throw new Error(`Invalid blog category: ${category}. Please ensure the category exists and is of type 'blogs'.`);
        }
        // Create blog post
        const blog = await blogModel_1.default.create({
            title,
            content,
            category: categoryId, // Use the resolved category ID
            image: image || "",
            author: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || "Prapti Foundation",
        });
        // Populate the category before returning
        await blog.populate("category", "name type");
        logger_1.default.info(`New blog post created: ${blog.title} by ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.email}`);
        res.status(201).json({
            success: true,
            message: "Blog post created successfully",
            data: blog,
        });
    }
    catch (error) {
        logger_1.default.error("Error creating blog post:", error);
        res.status(500).json({
            success: false,
            message: "Error creating blog post",
            error: error.message,
        });
    }
});
/**
 * @desc    Update blog post
 * @route   PUT /api/blogs/update/:id
 * @access  Private (Admin only)
 */
exports.updateBlogPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const { title, content, category, image } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
            return;
        }
        // Find blog post
        const blog = await blogModel_1.default.findById(id);
        if (!blog) {
            res.status(404).json({
                success: false,
                message: "Blog post not found",
            });
            return;
        }
        // Handle category update if provided
        if (category !== undefined) {
            // Debug logging
            console.log("Received category value:", category, typeof category);
            if (!category || typeof category !== "string") {
                res.status(400);
                throw new Error("Category must be a string");
            }
            // Try to find by ObjectId first, if that fails, try by name
            let categoryDoc;
            let categoryId = category;
            try {
                // First attempt: find by ObjectId
                const CategoryModel = require("../models/categoryModel").default;
                categoryDoc = await CategoryModel.findOne({
                    _id: category,
                    type: "blogs",
                });
            }
            catch (error) {
                // If ObjectId cast fails, category might be a name instead of ID
                console.log("ObjectId cast failed, trying to find by name:", category);
            }
            // If not found by ID, try to find by name
            if (!categoryDoc) {
                const CategoryModel = require("../models/categoryModel").default;
                categoryDoc = await CategoryModel.findOne({
                    name: category,
                    type: "blogs",
                });
                if (categoryDoc) {
                    console.log("Found category by name, using ID:", categoryDoc._id);
                    categoryId = categoryDoc._id.toString();
                }
            }
            if (!categoryDoc) {
                res.status(400);
                throw new Error(`Invalid blog category: ${category}. Please ensure the category exists and is of type 'blogs'.`);
            }
            // Update with resolved category ID
            blog.category = new mongoose_1.default.Types.ObjectId(categoryId);
        }
        // Update other fields
        if (title !== undefined)
            blog.title = title;
        if (content !== undefined)
            blog.content = content;
        if (image !== undefined)
            blog.image = image;
        await blog.save();
        // Populate the category before returning
        await blog.populate("category", "name type");
        logger_1.default.info(`Blog post updated: ${blog.title} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
        res.status(200).json({
            success: true,
            message: "Blog post updated successfully",
            data: blog,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating blog post:", error);
        res.status(500).json({
            success: false,
            message: "Error updating blog post",
            error: error.message,
        });
    }
});
/**
 * @desc    Delete blog post
 * @route   DELETE /api/blogs/delete/:id
 * @access  Private (Admin only)
 */
exports.deleteBlogPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
            return;
        }
        const blog = await blogModel_1.default.findById(id);
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
                    const deleteResult = await cloudinaryConfig_1.default.uploader.destroy(publicId);
                    logger_1.default.info(`Deleted image from Cloudinary: ${publicId}, result: ${deleteResult.result}`);
                }
            }
            catch (cloudinaryError) {
                // Log error but don't fail the blog deletion
                logger_1.default.error(`Failed to delete image from Cloudinary: ${cloudinaryError}`);
            }
        }
        await blogModel_1.default.findByIdAndDelete(id);
        logger_1.default.info(`Blog post deleted: ${blog.title} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
        res.status(200).json({
            success: true,
            message: "Blog post deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error deleting blog post:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting blog post",
            error: error.message,
        });
    }
});
