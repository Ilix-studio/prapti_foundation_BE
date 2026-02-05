"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delRescuePost = exports.updateRescuePost = exports.createRescuePost = exports.getByIdRescuePost = exports.getRescuePost = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const rescueModel_1 = __importDefault(require("../models/rescueModel"));
const mongoose_1 = require("mongoose");
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @desc    Get all rescue posts
 * @route   GET /api/rescue/get
 * @access  Public
 */
exports.getRescuePost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    // Build query
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const [rescuePosts, total] = await Promise.all([
        rescueModel_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        rescueModel_1.default.countDocuments(query),
    ]);
    res.status(200).json({
        success: true,
        data: rescuePosts,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});
/**
 * @desc    Get rescue post by ID
 * @route   GET /api/rescue/get/:id
 * @access  Public
 */
exports.getByIdRescuePost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid rescue post ID format");
    }
    const rescuePost = await rescueModel_1.default.findById(id);
    if (!rescuePost) {
        res.status(404);
        throw new Error("Rescue post not found");
    }
    res.status(200).json({
        success: true,
        data: rescuePost,
    });
});
/**
 * @desc    Create rescue post
 * @route   POST /api/rescue/create
 * @access  Private (Admin)
 */
exports.createRescuePost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { title, description } = req.body;
    const files = req.files;
    if (!title || !description) {
        res.status(400);
        throw new Error("Title and description are required");
    }
    if (!(files === null || files === void 0 ? void 0 : files.beforeImage) || !(files === null || files === void 0 ? void 0 : files.afterImage)) {
        res.status(400);
        throw new Error("Both before and after images are required");
    }
    try {
        // Upload both images
        const [beforeResult, afterResult] = await Promise.all([
            new Promise((resolve, reject) => {
                cloudinaryConfig_1.default.uploader
                    .upload_stream({
                    folder: "prapti-foundation-rescue",
                    resource_type: "image",
                    transformation: [
                        { width: 1200, height: 800, crop: "limit" },
                        { quality: "auto" },
                        { format: "auto" },
                    ],
                }, (error, result) => (error ? reject(error) : resolve(result)))
                    .end(files.beforeImage[0].buffer);
            }),
            new Promise((resolve, reject) => {
                cloudinaryConfig_1.default.uploader
                    .upload_stream({
                    folder: "prapti-foundation-rescue",
                    resource_type: "image",
                    transformation: [
                        { width: 1200, height: 800, crop: "limit" },
                        { quality: "auto" },
                        { format: "auto" },
                    ],
                }, (error, result) => (error ? reject(error) : resolve(result)))
                    .end(files.afterImage[0].buffer);
            }),
        ]);
        const rescuePost = await rescueModel_1.default.create({
            title: title.trim(),
            description: description.trim(),
            beforeImage: beforeResult.secure_url,
            afterImage: afterResult.secure_url,
        });
        logger_1.default.info(`Rescue post created: ${rescuePost._id}`);
        res.status(201).json({
            success: true,
            message: "Rescue post created successfully",
            data: rescuePost,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to create rescue post: ${error.message}`);
        res.status(500);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
});
/**
 * @desc    Update rescue post
 * @route   PATCH /api/rescue/update/:id
 * @access  Private (Admin)
 */
exports.updateRescuePost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, imageAction, imageType, // "before" or "after"
     } = req.body;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid rescue post ID format");
    }
    const rescuePost = await rescueModel_1.default.findById(id);
    if (!rescuePost) {
        res.status(404);
        throw new Error("Rescue post not found");
    }
    // Handle image operations
    if (imageAction) {
        switch (imageAction) {
            case "add": {
                if (!req.file) {
                    res.status(400);
                    throw new Error("No file uploaded for image addition");
                }
                if (!imageType || !["before", "after"].includes(imageType)) {
                    res.status(400);
                    throw new Error('imageType must be "before" or "after"');
                }
                try {
                    const uploadResult = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                            folder: "prapti-foundation-rescue",
                            resource_type: "image",
                            transformation: [
                                { width: 1200, height: 800, crop: "limit" },
                                { quality: "auto" },
                                { format: "auto" },
                            ],
                        }, (error, result) => {
                            if (error) {
                                logger_1.default.error(`Cloudinary upload failed: ${error.message}`);
                                reject(error);
                            }
                            else {
                                resolve(result);
                            }
                        });
                        uploadStream.end(req.file.buffer);
                    });
                    // Delete old image from Cloudinary
                    const oldImageUrl = imageType === "before"
                        ? rescuePost.beforeImage
                        : rescuePost.afterImage;
                    const oldPublicId = extractPublicIdFromUrl(oldImageUrl);
                    if (oldPublicId) {
                        try {
                            await cloudinaryConfig_1.default.uploader.destroy(oldPublicId);
                            logger_1.default.info(`Deleted old ${imageType} image: ${oldPublicId}`);
                        }
                        catch (error) {
                            logger_1.default.warn(`Failed to delete old image: ${error.message}`);
                        }
                    }
                    // Update with new image
                    if (imageType === "before") {
                        rescuePost.beforeImage = uploadResult.secure_url;
                    }
                    else {
                        rescuePost.afterImage = uploadResult.secure_url;
                    }
                    logger_1.default.info(`${imageType} image updated for rescue ${id}: ${uploadResult.public_id}`);
                }
                catch (error) {
                    res.status(500);
                    throw new Error(`Failed to upload image: ${error.message}`);
                }
                break;
            }
            case "delete": {
                res.status(400);
                throw new Error("Cannot delete images. Use 'add' action to replace instead.");
            }
            default:
                res.status(400);
                throw new Error(`Invalid imageAction: "${imageAction}". Use: add`);
        }
    }
    // Update text fields
    if (title !== undefined && title !== null) {
        const trimmedTitle = String(title).trim();
        if (trimmedTitle.length === 0) {
            res.status(400);
            throw new Error("Title cannot be empty");
        }
        rescuePost.title = trimmedTitle;
    }
    if (description !== undefined && description !== null) {
        rescuePost.description = String(description).trim();
    }
    // Save changes
    try {
        const updatedPost = await rescuePost.save();
        logger_1.default.info(`Rescue post updated: ${updatedPost._id}`);
        res.status(200).json({
            success: true,
            message: "Rescue post updated successfully",
            data: updatedPost,
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400);
            throw new Error(`Validation error: ${validationErrors.join(", ")}`);
        }
        logger_1.default.error(`Failed to save rescue post: ${error.message}`);
        throw error;
    }
});
/**
 * @desc    Delete rescue post
 * @route   DELETE /api/rescue/del/:id
 * @access  Private (Admin)
 */
exports.delRescuePost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid rescue post ID format");
    }
    const rescuePost = await rescueModel_1.default.findById(id);
    if (!rescuePost) {
        res.status(404);
        throw new Error("Rescue post not found");
    }
    // Delete both images from Cloudinary
    const deletePromises = [
        extractPublicIdFromUrl(rescuePost.beforeImage),
        extractPublicIdFromUrl(rescuePost.afterImage),
    ]
        .filter(Boolean)
        .map(async (publicId) => {
        try {
            const result = await cloudinaryConfig_1.default.uploader.destroy(publicId);
            logger_1.default.info(`Deleted image from Cloudinary: ${publicId}, result: ${result.result}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete image from Cloudinary: ${error.message}`);
        }
    });
    await Promise.allSettled(deletePromises);
    await rescueModel_1.default.findByIdAndDelete(id);
    logger_1.default.info(`Rescue post deleted: ${rescuePost.title}`);
    res.status(200).json({
        success: true,
        message: "Rescue post deleted successfully",
    });
});
/**
 * Helper function to extract Cloudinary public ID from URL
 */
function extractPublicIdFromUrl(url) {
    try {
        const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/i);
        if (matches && matches[1]) {
            // Check if there's a folder path
            const folderMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);
            if (folderMatch && folderMatch[1]) {
                return folderMatch[1];
            }
            return matches[1];
        }
        return null;
    }
    catch (error) {
        logger_1.default.error(`Error extracting public ID from URL: ${error}`);
        return null;
    }
}
