"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/video.ts
const express_1 = __importDefault(require("express"));
const videoController_1 = require("../controllers/videoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const router = express_1.default.Router();
// Public routes
router.get("/", rateLimitMiddleware_1.apiLimiter, videoController_1.getVideos);
router.get("/:id", rateLimitMiddleware_1.apiLimiter, videoController_1.getVideoById);
// Category routes (public)
router.get("/categories", rateLimitMiddleware_1.apiLimiter, videoController_1.getVideoCategories);
router.get("/categories/counts", rateLimitMiddleware_1.apiLimiter, videoController_1.getVideoCategoriesWithCounts);
// Protected routes (Admin only)
router.use(authMiddleware_1.protect); // All routes below require authentication
// Video management
router.post("/upload", multerConfig_1.videoUploadConfig.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), multerConfig_1.handleMulterError, videoController_1.uploadVideo);
router.post("/", videoController_1.createVideo);
router.put("/:id", multerConfig_1.videoUploadConfig.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), multerConfig_1.handleMulterError, videoController_1.updateVideo);
router.delete("/:id", videoController_1.deleteVideo);
// Category management (protected)
router.post("/categories", videoController_1.createVideoCategory);
router.put("/categories/:id", videoController_1.updateVideoCategory);
router.delete("/categories/:id", videoController_1.deleteVideoCategory);
exports.default = router;
