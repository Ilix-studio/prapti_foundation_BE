"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAwardPost = exports.updateAwardPost = exports.getByIdAwardPost = exports.uploadMultipleAwards = exports.uploadAward = exports.createAwardPost = exports.getAwardPost = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const awardModel_1 = __importDefault(require("../models/awardModel"));
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importStar(require("mongoose"));
/**
 * @desc    Get all award posts
 * @route   GET /api/awards
 * @access  Public
 */
exports.getAwardPost = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const awards = await awardModel_1.default.find({})
            .populate("category", "name type")
            .sort({ createdAt: -1 });
        res.status(200).json(awards);
    }
    catch (error) {
        logger_1.default.error("Error fetching Award posts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching Award posts",
            error: error.message,
        });
    }
});
/**
 * @desc    Create all award posts
 * @route   Create /api/awards
 * @access  Public
 */
exports.createAwardPost = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, category, images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400);
        throw new Error("At least one image is required");
    }
    // Debug logging
    console.log("Received category value:", category, typeof category);
    // Validate category exists and is type "award"
    if (!category || typeof category !== "string") {
        res.status(400);
        throw new Error("Category is required and must be a string");
    }
    // Try to find by ObjectId first, if that fails, try by name
    let categoryDoc;
    let categoryId = category; // Use a separate variable for the actual ID
    try {
        // First attempt: find by ObjectId
        categoryDoc = await categoryModel_1.default.findOne({
            _id: category,
            type: "award",
        });
    }
    catch (error) {
        // If ObjectId cast fails, category might be a name instead of ID
        console.log("ObjectId cast failed, trying to find by name:", category);
    }
    // If not found by ID, try to find by name
    if (!categoryDoc) {
        categoryDoc = await categoryModel_1.default.findOne({
            name: category,
            type: "award",
        });
        if (categoryDoc) {
            console.log("Found category by name, using ID:", categoryDoc._id);
            // Update the categoryId variable to use the correct ObjectId
            categoryId = categoryDoc._id.toString();
        }
    }
    if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid award category: ${category}. Please ensure the category exists and is of type 'award'.`);
    }
    const award = await awardModel_1.default.create({
        title,
        description: description || undefined,
        category: categoryId,
        images,
    });
    await award.populate("category");
    res.status(201).json({
        success: true,
        message: "Award Info created successfully",
        data: award,
    });
});
/**
 * Upload single award
 * @route POST /api/awards/upload
 * @access Private (Admin only)
 */
exports.uploadAward = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("No file uploaded");
    }
    const { alt, title, category, description } = req.body;
    // Validate required fields
    if (!title || typeof title !== "string") {
        res.status(400);
        throw new Error("Title is required and must be a string");
    }
    if (!category || typeof category !== "string") {
        res.status(400);
        throw new Error("Category is required and must be a string");
    }
    // Find category by ID or name
    let categoryDoc;
    if (mongoose_1.Types.ObjectId.isValid(category)) {
        categoryDoc = await categoryModel_1.default.findOne({
            _id: category,
            type: "award",
        });
    }
    if (!categoryDoc) {
        categoryDoc = await categoryModel_1.default.findOne({
            name: category,
            type: "award",
        });
    }
    if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid award category: ${category}. Category must exist and be of type 'award'.`);
    }
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinaryConfig_1.default.uploader
            .upload_stream({
            folder: "prapti-foundation-awards",
            resource_type: "image",
            transformation: [
                { width: 1200, height: 800, crop: "limit" },
                { quality: "auto" },
                { format: "auto" },
            ],
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        })
            .end(req.file.buffer);
    });
    // Create award record
    const award = await awardModel_1.default.create({
        images: [
            {
                src: uploadResult.secure_url,
                alt: alt || title,
                cloudinaryPublicId: uploadResult.public_id,
            },
        ],
        title,
        category: categoryDoc._id,
        description: description || undefined,
    });
    await award.populate("category");
    res.status(201).json({
        success: true,
        message: "Award uploaded successfully",
        data: {
            award,
            imagesCount: 1,
        },
    });
});
/**
 * Upload multiple awards to Cloudinary and save to database
 * @route POST /api/awards/upload-multiple
 * @access Private (Admin only)
 */
exports.uploadMultipleAwards = (0, express_async_handler_1.default)(async (req, res) => {
    // Validate files
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400);
        throw new Error("No files uploaded");
    }
    const files = req.files;
    const { title, category, description, altTexts } = req.body;
    // Validate required fields
    if (!title || typeof title !== "string") {
        res.status(400);
        throw new Error("Title is required and must be a string");
    }
    if (!category || typeof category !== "string") {
        res.status(400);
        throw new Error("Category is required and must be a string");
    }
    // Find category - handle both ObjectId and name
    let categoryDoc;
    // Try ObjectId first
    if (mongoose_1.default.Types.ObjectId.isValid(category)) {
        categoryDoc = await categoryModel_1.default.findOne({
            _id: category,
            type: "award",
        });
    }
    // If not found, try by name
    if (!categoryDoc) {
        categoryDoc = await categoryModel_1.default.findOne({
            name: category,
            type: "award",
        });
    }
    if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid award category: ${category}. Ensure the category exists and is type 'award'.`);
    }
    // Parse altTexts
    let altTextsArray = [];
    if (typeof altTexts === "string") {
        try {
            altTextsArray = JSON.parse(altTexts);
        }
        catch (_a) {
            altTextsArray = [altTexts];
        }
    }
    else if (Array.isArray(altTexts)) {
        altTextsArray = altTexts;
    }
    // Upload to Cloudinary
    const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                folder: "prapti-foundation-awards",
                resource_type: "image",
                transformation: [
                    { width: 1200, height: 800, crop: "limit" },
                    { quality: "auto" },
                    { format: "auto" },
                ],
            }, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Upload failed - no result returned"));
                }
                resolve({
                    src: result.secure_url,
                    alt: altTextsArray[index] || title,
                    cloudinaryPublicId: result.public_id,
                });
            });
            uploadStream.end(file.buffer);
        });
    });
    let uploadedImages;
    try {
        uploadedImages = await Promise.all(uploadPromises);
    }
    catch (error) {
        console.error("Failed to upload images:", error);
        res.status(500);
        throw new Error(`Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    // Create award
    const award = await awardModel_1.default.create({
        images: uploadedImages,
        title,
        category: categoryDoc._id,
        description: description || undefined,
    });
    await award.populate("category", "name type");
    res.status(201).json({
        success: true,
        message: "Awards uploaded successfully",
        data: {
            award,
            imagesCount: uploadedImages.length,
        },
    });
});
/**
 * @desc    GetBy all award posts
 * @route   GET /api/awards/:id
 * @access  Public
 */
exports.getByIdAwardPost = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Award ID is required",
            });
            return;
        }
        const award = await awardModel_1.default.findById(id).populate("category", "name type");
        if (!award) {
            res.status(404).json({
                success: false,
                message: "award post not found",
            });
            return;
        }
        res.status(200).json(award);
    }
    catch (error) {
        logger_1.default.error("Error fetching award post:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching award post",
            error: error.message,
        });
    }
});
/**
 * @desc    Update award post with image management
 * @route   PATCH /api/awards/update/:id
 * @access  Private (Admin only)
 */
exports.updateAwardPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, category, imageAction, imageIndex, imageAlt } = req.body;
    // Validate ID format
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid award ID format");
    }
    const award = await awardModel_1.default.findById(id);
    if (!award) {
        res.status(404);
        throw new Error("Award post not found");
    }
    // Handle image operations
    if (imageAction) {
        const parsedIndex = imageIndex !== undefined ? parseInt(imageIndex, 10) : NaN;
        switch (imageAction) {
            case "add": {
                if (!req.file) {
                    res.status(400);
                    throw new Error("No file uploaded for image addition");
                }
                if (award.images.length >= 10) {
                    res.status(400);
                    throw new Error("Maximum 10 images allowed per award");
                }
                try {
                    const uploadResult = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                            folder: "prapti-foundation-awards",
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
                    award.images.push({
                        src: uploadResult.secure_url,
                        alt: imageAlt || award.title,
                        cloudinaryPublicId: uploadResult.public_id,
                    });
                    logger_1.default.info(`Image added to award ${id}: ${uploadResult.public_id}`);
                }
                catch (error) {
                    res.status(500);
                    throw new Error(`Failed to upload image: ${error.message}`);
                }
                break;
            }
            case "delete": {
                // Validate index
                if (isNaN(parsedIndex)) {
                    res.status(400);
                    throw new Error("imageIndex is required for delete action");
                }
                if (parsedIndex < 0 || parsedIndex >= award.images.length) {
                    res.status(400);
                    throw new Error(`Invalid image index: ${parsedIndex}. Valid range: 0-${award.images.length - 1}`);
                }
                // Check if this is the last image - only block if no new images being added
                // Allow deletion if there will be at least one image remaining
                if (award.images.length === 1) {
                    res.status(400);
                    throw new Error("Cannot delete the last image. Upload a new image first or keep at least one image.");
                }
                const imageToDelete = award.images[parsedIndex];
                if (!imageToDelete) {
                    res.status(400);
                    throw new Error(`No image found at index ${parsedIndex}`);
                }
                // Delete from Cloudinary (non-blocking - continue even if fails)
                if (imageToDelete.cloudinaryPublicId) {
                    try {
                        await cloudinaryConfig_1.default.uploader.destroy(imageToDelete.cloudinaryPublicId);
                        logger_1.default.info(`Deleted from Cloudinary: ${imageToDelete.cloudinaryPublicId}`);
                    }
                    catch (cloudinaryError) {
                        // Log but don't fail the request - image might already be deleted
                        logger_1.default.warn(`Cloudinary deletion warning for ${imageToDelete.cloudinaryPublicId}: ${cloudinaryError.message}`);
                    }
                }
                // Remove from array
                award.images.splice(parsedIndex, 1);
                logger_1.default.info(`Image at index ${parsedIndex} removed from award ${id}`);
                break;
            }
            case "updateAlt": {
                if (isNaN(parsedIndex)) {
                    res.status(400);
                    throw new Error("imageIndex is required for updateAlt action");
                }
                if (parsedIndex < 0 || parsedIndex >= award.images.length) {
                    res.status(400);
                    throw new Error(`Invalid image index: ${parsedIndex}. Valid range: 0-${award.images.length - 1}`);
                }
                if (!imageAlt || typeof imageAlt !== "string") {
                    res.status(400);
                    throw new Error("imageAlt text is required and must be a string");
                }
                award.images[parsedIndex].alt = imageAlt.trim();
                logger_1.default.info(`Alt text updated for image at index ${parsedIndex}`);
                break;
            }
            default:
                res.status(400);
                throw new Error(`Invalid imageAction: "${imageAction}". Use: add, delete, or updateAlt`);
        }
    }
    // Handle category update
    if (category !== undefined && category !== null && category !== "") {
        if (typeof category !== "string") {
            res.status(400);
            throw new Error("Category must be a string");
        }
        let categoryDoc = null;
        // First try to find by ObjectId
        if (mongoose_1.Types.ObjectId.isValid(category)) {
            categoryDoc = await categoryModel_1.default.findOne({
                _id: category,
                type: "award",
            });
        }
        // If not found by ID, try by name
        if (!categoryDoc) {
            categoryDoc = await categoryModel_1.default.findOne({
                name: { $regex: new RegExp(`^${category}$`, "i") },
                type: "award",
            });
        }
        if (!categoryDoc) {
            res.status(400);
            throw new Error(`Invalid award category: "${category}". Please select a valid category.`);
        }
        award.category = categoryDoc._id;
    }
    // Update text fields (only if provided)
    if (title !== undefined && title !== null) {
        const trimmedTitle = String(title).trim();
        if (trimmedTitle.length === 0) {
            res.status(400);
            throw new Error("Title cannot be empty");
        }
        award.title = trimmedTitle;
    }
    if (description !== undefined && description !== null) {
        award.description = String(description).trim();
    }
    // Save changes
    try {
        const updatedAward = await award.save();
        await updatedAward.populate("category", "name type");
        logger_1.default.info(`Award updated successfully: ${updatedAward._id}`);
        res.status(200).json({
            success: true,
            message: "Award updated successfully",
            data: updatedAward,
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400);
            throw new Error(`Validation error: ${validationErrors.join(", ")}`);
        }
        logger_1.default.error(`Failed to save award: ${error.message}`);
        throw error;
    }
});
/**
 * @desc    Delete all award posts
 * @route   DELETE /api/awards/del/:id
 * @access  Private (Admin only)
 */
exports.delAwardPost = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // Validate ObjectId format
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid award ID format");
    }
    const award = await awardModel_1.default.findById(id);
    if (!award) {
        res.status(404);
        throw new Error("Award post not found");
    }
    // Delete all images from Cloudinary
    const deletePromises = award.images.map(async (image) => {
        try {
            if (image.cloudinaryPublicId) {
                const deleteResult = await cloudinaryConfig_1.default.uploader.destroy(image.cloudinaryPublicId);
                logger_1.default.info(`Deleted image from Cloudinary: ${image.cloudinaryPublicId}, result: ${deleteResult.result}`);
            }
        }
        catch (cloudinaryError) {
            // Log error but don't fail the deletion
            logger_1.default.error(`Failed to delete image from Cloudinary: ${cloudinaryError}`);
        }
    });
    // Wait for all Cloudinary deletions to complete
    await Promise.allSettled(deletePromises);
    // Delete from database
    await awardModel_1.default.findByIdAndDelete(id);
    logger_1.default.info(`Award post deleted: ${award.title}`);
    res.status(200).json({
        success: true,
        message: "Award post deleted successfully",
    });
});
