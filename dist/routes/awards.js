"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const award_controller_1 = require("../controllers/award.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const router = express_1.default.Router();
router.post("/create", authMiddleware_1.protect, award_controller_1.createAwardPost);
// Single photo upload
router.post("/upload", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.single("image"), multerConfig_1.handleMulterError, award_controller_1.uploadAward);
// Multiple photos upload
router.post("/upload-multiple", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.array("images", 10), // Max 10 photos
multerConfig_1.handleMulterError, award_controller_1.uploadMultipleAwards);
router.get("/get", award_controller_1.getAwardPost);
router.get("/get/:id", award_controller_1.getByIdAwardPost);
router.patch("/update/:id", multerConfig_1.photoUploadConfig.single("image"), award_controller_1.updateAwardPost);
router.delete("/del/:id", award_controller_1.delAwardPost);
exports.default = router;
