"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideoCategory = exports.updateVideoCategory = exports.createVideoCategory = exports.getVideoCategoriesWithCounts = exports.getVideoCategories = exports.deleteVideo = exports.updateVideo = exports.createVideo = exports.uploadVideo = exports.getVideoById = exports.getVideos = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const VideoModel_1 = __importDefault(require("../models/VideoModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const mongoose_1 = require("mongoose");
/**
 * @desc    Get all videos with filtering, pagination, and search
 * @route   GET /api/videos
 * @access  Public
 */
exports.getVideos = (0, express_async_handler_1.default)(async (req, res) => {
    const { page = "1", limit = "12", category, search, sortBy = "date", sortOrder = "desc", } = req.query;
    const query = { isActive: true };
    if (category && category !== "all") {
        // Check if it's a valid ObjectId
        if (mongoose_1.Types.ObjectId.isValid(category)) {
            query.category = new mongoose_1.Types.ObjectId(category);
        }
        else {
            // Fallback: try to find by name
            const categoryDoc = await categoryModel_1.default.findOne({
                name: category,
                type: "video",
            });
            if (!categoryDoc) {
                res.status(400);
                throw new Error(`Invalid category: ${category}`);
            }
            query.category = categoryDoc._id;
        }
    }
    if (search && search.trim()) {
        query.$text = { $search: search.trim() };
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const videos = await VideoModel_1.default.find(query)
        .populate("category", "name type")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();
    const total = await VideoModel_1.default.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    res.status(200).json({
        success: true,
        data: {
            videos,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalVideos: total,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum,
            },
        },
    });
});
/**
 * @desc    Get single video by ID
 * @route   GET /api/videos/:id
 * @access  Public
 */
exports.getVideoById = (0, express_async_handler_1.default)(async (req, res) => {
    const video = await VideoModel_1.default.findById(req.params.id).populate("category", "name type");
    if (!video) {
        res.status(404);
        throw new Error("Video not found");
    }
    if (!video.isActive) {
        res.status(404);
        throw new Error("Video not available");
    }
    res.status(200).json({
        success: true,
        data: { video },
    });
});
/**
 * @desc    Upload video with file to Cloudinary
 * @route   POST /api/videos/upload
 * @access  Private/Admin
 */
exports.uploadVideo = (0, express_async_handler_1.default)(async (req, res) => {
    console.log("Upload request received:", {
        files: req.files,
        body: req.body,
        headers: req.headers["content-type"],
    });
    // Check if video file is uploaded
    if (!req.files) {
        res.status(400);
        throw new Error("No files uploaded");
    }
    // Type assertion for multer files
    const files = req.files;
    if (!files.video || !files.video[0]) {
        res.status(400);
        throw new Error("Video file is required");
    }
    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail ? files.thumbnail[0] : null;
    console.log("Processing files:", {
        videoFile: {
            originalname: videoFile.originalname,
            mimetype: videoFile.mimetype,
            size: videoFile.size,
        },
        thumbnailFile: thumbnailFile
            ? {
                originalname: thumbnailFile.originalname,
                mimetype: thumbnailFile.mimetype,
                size: thumbnailFile.size,
            }
            : null,
    });
    const { title, description, category, date, duration } = req.body;
    // Validate required fields
    if (!title || !description || !category || !date || !duration) {
        res.status(400);
        throw new Error("All required fields must be provided");
    }
    // Try to find by ObjectId first, if that fails, try by name
    let categoryDoc;
    let categoryId = category; // Use a separate variable for the actual ID
    try {
        // First attempt: find by ObjectId
        categoryDoc = await categoryModel_1.default.findOne({
            _id: category,
            type: "video",
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
            type: "video",
        });
        if (categoryDoc) {
            console.log("Found category by name, using ID:", categoryDoc._id);
            // Use the correct ObjectId for database insertion
            categoryId = categoryDoc._id.toString();
        }
    }
    if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid video category: ${category}. Please ensure the category exists and is of type 'video'.`);
    }
    // Upload video to Cloudinary
    const videoUploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
            resource_type: "video",
            folder: "prapti-foundation-videos",
            quality: "auto",
            format: "mp4",
        }, (error, result) => {
            if (error) {
                console.error("Cloudinary video upload error:", error);
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        uploadStream.end(videoFile.buffer);
    });
    const videoResult = videoUploadResult;
    console.log("Video uploaded to Cloudinary:", videoResult.public_id);
    // Upload thumbnail if provided, otherwise use video thumbnail
    let thumbnailResult;
    if (thumbnailFile) {
        thumbnailResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                resource_type: "image",
                folder: "prapti-foundation-thumbnails",
                quality: "auto",
                format: "jpg",
                transformation: [{ width: 1280, height: 720, crop: "fill" }],
            }, (error, result) => {
                if (error) {
                    console.error("Cloudinary thumbnail upload error:", error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            uploadStream.end(thumbnailFile.buffer);
        });
    }
    else {
        // Generate thumbnail from video
        thumbnailResult = await cloudinaryConfig_1.default.uploader.upload(videoResult.secure_url, {
            resource_type: "video",
            public_id: `${videoResult.public_id}_thumbnail`,
            format: "jpg",
            transformation: [{ width: 1280, height: 720, crop: "fill" }],
        });
    }
    const thumbnail = thumbnailResult;
    console.log("Thumbnail processed:", thumbnail.public_id);
    // Create video document
    const video = await VideoModel_1.default.create({
        title,
        description,
        thumbnail: thumbnail.secure_url,
        videoUrl: videoResult.secure_url,
        date: new Date(date),
        category: categoryId, // Use the resolved category ID
        duration,
        publicId: videoResult.public_id,
        thumbnailPublicId: thumbnail.public_id,
    });
    const populatedVideo = await VideoModel_1.default.findById(video._id).populate("category", "name type");
    console.log("Video saved to database:", video._id);
    res.status(201).json({
        success: true,
        message: "Video uploaded successfully",
        data: { video: populatedVideo },
    });
});
/**
 * @desc    Create video with existing Cloudinary URLs
 * @route   POST /api/videos
 * @access  Private/Admin
 */
exports.createVideo = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, thumbnail, videoUrl, date, category, duration, publicId, thumbnailPublicId, } = req.body;
    // Validate required fields
    if (!title ||
        !description ||
        !thumbnail ||
        !videoUrl ||
        !date ||
        !category ||
        !duration ||
        !publicId) {
        res.status(400);
        throw new Error("All required fields must be provided");
    }
    // Validate category exists and is of type 'video'
    const categoryDoc = await categoryModel_1.default.findOne({
        _id: category,
        type: "video",
    });
    if (!categoryDoc) {
        res.status(400);
        throw new Error("Invalid video category");
    }
    const video = await VideoModel_1.default.create({
        title,
        description,
        thumbnail,
        videoUrl,
        date: new Date(date),
        category,
        duration,
        publicId,
        thumbnailPublicId,
    });
    const populatedVideo = await VideoModel_1.default.findById(video._id).populate("category", "name type");
    res.status(201).json({
        success: true,
        message: "Video created successfully",
        data: { video: populatedVideo },
    });
});
/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private/Admin
 */
exports.updateVideo = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    console.log("Update video request:", {
        id: req.params.id,
        body: req.body,
        files: req.files,
        contentType: req.headers["content-type"],
    });
    const video = await VideoModel_1.default.findById(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error("Video not found");
    }
    // Handle both multipart/form-data and JSON data
    const isMultipart = (_a = req.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.includes("multipart/form-data");
    // For JSON requests, check if body exists
    if (!isMultipart && (!req.body || Object.keys(req.body).length === 0)) {
        res.status(400);
        throw new Error("Request body is empty or invalid");
    }
    // Handle file uploads if present (multipart requests)
    let videoUploadResult = null;
    let thumbnailUploadResult = null;
    if (isMultipart && req.files) {
        const files = req.files;
        // Handle video file upload
        if (files.video && files.video[0]) {
            const videoFile = files.video[0];
            console.log("Uploading new video file:", videoFile.originalname);
            // Delete old video from Cloudinary if it exists
            if (video.publicId) {
                await cloudinaryConfig_1.default.uploader.destroy(video.publicId, {
                    resource_type: "video",
                });
            }
            // Upload new video to Cloudinary
            videoUploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                    resource_type: "video",
                    folder: "prapti-foundation-images",
                    quality: "auto",
                    format: "mp4",
                }, (error, result) => {
                    if (error) {
                        console.error("Cloudinary video upload error:", error);
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                uploadStream.end(videoFile.buffer);
            });
            // Update request body with new video data
            req.body.videoUrl = videoUploadResult.secure_url;
            req.body.publicId = videoUploadResult.public_id;
        }
        // Handle thumbnail file upload
        if (files.thumbnail && files.thumbnail[0]) {
            const thumbnailFile = files.thumbnail[0];
            console.log("Uploading new thumbnail file:", thumbnailFile.originalname);
            // Delete old thumbnail from Cloudinary if it exists
            if (video.thumbnailPublicId) {
                await cloudinaryConfig_1.default.uploader.destroy(video.thumbnailPublicId, {
                    resource_type: "image",
                });
            }
            // Upload new thumbnail to Cloudinary
            thumbnailUploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinaryConfig_1.default.uploader.upload_stream({
                    resource_type: "image",
                    folder: "prapti-foundation-thumbnails",
                    quality: "auto",
                    format: "jpg",
                    transformation: [{ width: 1280, height: 720, crop: "fill" }],
                }, (error, result) => {
                    if (error) {
                        console.error("Cloudinary thumbnail upload error:", error);
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                uploadStream.end(thumbnailFile.buffer);
            });
            // Update request body with new thumbnail data
            req.body.thumbnail = thumbnailUploadResult.secure_url;
            req.body.thumbnailPublicId = thumbnailUploadResult.public_id;
        }
    }
    // Validate category if provided (using uploadVideo logic)
    if (req.body.category) {
        const { category } = req.body;
        // Try to find by ObjectId first, if that fails, try by name
        let categoryDoc;
        let categoryId = category; // Use a separate variable for the actual ID
        try {
            // First attempt: find by ObjectId
            categoryDoc = await categoryModel_1.default.findOne({
                _id: category,
                type: "video",
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
                type: "video",
            });
            if (categoryDoc) {
                console.log("Found category by name, using ID:", categoryDoc._id);
                // Use the correct ObjectId for database insertion
                categoryId = categoryDoc._id.toString();
            }
        }
        if (!categoryDoc) {
            res.status(400);
            throw new Error(`Invalid video category: ${category}. Please ensure the category exists and is of type 'video'.`);
        }
        // Update the category in request body with the resolved ID
        req.body.category = categoryId;
    }
    // Process tags if provided
    if (req.body.tags) {
        req.body.tags =
            typeof req.body.tags === "string"
                ? req.body.tags.split(",").map((tag) => tag.trim())
                : req.body.tags;
    }
    // Convert date string to Date object if provided
    if (req.body.date) {
        req.body.date = new Date(req.body.date);
    }
    // Convert featured string to boolean if provided (from form data)
    if (req.body.featured !== undefined) {
        req.body.featured =
            req.body.featured === "true" || req.body.featured === true;
    }
    // Update video with error handling
    try {
        const updatedVideo = await VideoModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate("category", "name type");
        // Check if update was successful
        if (!updatedVideo) {
            res.status(404);
            throw new Error("Video not found or update failed");
        }
        console.log("Video updated successfully:", updatedVideo._id);
        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            data: { video: updatedVideo },
        });
    }
    catch (updateError) {
        console.error("Update video error:", updateError);
        // Cleanup uploaded files if database update fails
        if (videoUploadResult) {
            await cloudinaryConfig_1.default.uploader.destroy(videoUploadResult.public_id, {
                resource_type: "video",
            });
        }
        if (thumbnailUploadResult) {
            await cloudinaryConfig_1.default.uploader.destroy(thumbnailUploadResult.public_id, {
                resource_type: "image",
            });
        }
        // Type guard for Error objects
        if (updateError instanceof Error) {
            // Handle specific MongoDB validation errors
            if (updateError.name === "ValidationError") {
                const validationErrors = Object.values(updateError.errors).map((err) => err.message);
                res.status(400);
                throw new Error(`Validation error: ${validationErrors.join(", ")}`);
            }
            // Handle cast errors (invalid ObjectId)
            if (updateError.name === "CastError") {
                res.status(400);
                throw new Error("Invalid video ID format");
            }
            // Re-throw other errors
            throw updateError;
        }
        // Handle non-Error objects
        res.status(500);
        throw new Error("An unexpected error occurred during video update");
    }
});
/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private/Admin
 */
exports.deleteVideo = (0, express_async_handler_1.default)(async (req, res) => {
    const video = await VideoModel_1.default.findById(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error("Video not found");
    }
    // Delete from Cloudinary
    if (video.publicId) {
        await cloudinaryConfig_1.default.uploader.destroy(video.publicId, {
            resource_type: "video",
        });
    }
    // Delete thumbnail if exists
    if (video.thumbnailPublicId) {
        await cloudinaryConfig_1.default.uploader.destroy(video.thumbnailPublicId, {
            resource_type: "image",
        });
    }
    // Delete from database
    await VideoModel_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: "Video deleted successfully",
    });
});
// ============ CATEGORY MANAGEMENT FUNCTIONS ============
/**
 * @desc    Get video categories
 * @route   GET /api/videos/categories
 * @access  Public
 */
exports.getVideoCategories = (0, express_async_handler_1.default)(async (req, res) => {
    const categories = await categoryModel_1.default.find({ type: "video" }).sort({
        name: 1,
    });
    res.status(200).json({
        success: true,
        data: categories,
    });
});
/**
 * @desc    Get video categories with counts
 * @route   GET /api/videos/categories/counts
 * @access  Public
 */
exports.getVideoCategoriesWithCounts = (0, express_async_handler_1.default)(async (req, res) => {
    // Get all video categories
    const categories = await categoryModel_1.default.find({ type: "video" });
    // Get video counts for each category
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
        const count = await VideoModel_1.default.countDocuments({
            category: category._id,
            isActive: true,
        });
        return {
            id: category._id,
            name: category.name,
            count,
        };
    }));
    // Sort by count (descending)
    categoriesWithCounts.sort((a, b) => b.count - a.count);
    res.status(200).json({
        success: true,
        data: categoriesWithCounts,
    });
});
/**
 * @desc    Create video category
 * @route   POST /api/videos/categories
 * @access  Private/Admin
 */
exports.createVideoCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Category name is required");
    }
    const category = await categoryModel_1.default.create({
        name,
        type: "video",
    });
    res.status(201).json({
        success: true,
        message: "Video category created successfully",
        data: category,
    });
});
/**
 * @desc    Update video category
 * @route   PUT /api/videos/categories/:id
 * @access  Private/Admin
 */
exports.updateVideoCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Category name is required");
    }
    // Ensure we're only updating video categories
    const category = await categoryModel_1.default.findOne({
        _id: req.params.id,
        type: "video",
    });
    if (!category) {
        res.status(404);
        throw new Error("Video category not found");
    }
    const updatedCategory = await categoryModel_1.default.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: "Video category updated successfully",
        data: updatedCategory,
    });
});
/**
 * @desc    Delete video category
 * @route   DELETE /api/videos/categories/:id
 * @access  Private/Admin
 */
exports.deleteVideoCategory = (0, express_async_handler_1.default)(async (req, res) => {
    // Ensure we're only deleting video categories
    const category = await categoryModel_1.default.findOne({
        _id: req.params.id,
        type: "video",
    });
    if (!category) {
        res.status(404);
        throw new Error("Video category not found");
    }
    // Check if category is being used by any videos
    const isUsed = await VideoModel_1.default.findOne({ category: req.params.id });
    if (isUsed) {
        res.status(400);
        throw new Error("Cannot delete category that is currently in use by videos");
    }
    await categoryModel_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: "Video category deleted successfully",
    });
});
