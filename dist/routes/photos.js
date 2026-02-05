"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const photoController_1 = require("../controllers/photoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const router = express_1.default.Router();
// Public routes
router.get("/", photoController_1.getPhotos);
router.get("/:id", photoController_1.getPhoto);
// Protected routes (Admin only)
router.post("/", authMiddleware_1.protect, photoController_1.createPhoto);
// Single photo upload
router.post("/upload", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.single("photo"), multerConfig_1.handleMulterError, photoController_1.uploadPhoto);
// Multiple photos upload
router.post("/upload-multiple", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.array("photos", 10), // Max 10 photos
multerConfig_1.handleMulterError, photoController_1.uploadMultiplePhotos);
// Update photo metadata only (JSON)
router.patch("/:id", authMiddleware_1.protect, photoController_1.updatePhoto);
// Update photo with file upload (form-data)
router.patch("/:id/upload", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.single("photo"), multerConfig_1.handleMulterError, photoController_1.updatePhotoWithFile);
router.delete("/:id", authMiddleware_1.protect, photoController_1.deletePhoto);
exports.default = router;
