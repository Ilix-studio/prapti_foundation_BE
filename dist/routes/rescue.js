"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rescue_controller_1 = require("../controllers/rescue.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const router = express_1.default.Router();
// Public routes
router.get("/get", rescue_controller_1.getRescuePost);
router.get("/get/:id", rescue_controller_1.getByIdRescuePost);
// Protected routes (admin only)
router.post("/create", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.fields([
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
]), multerConfig_1.handleMulterError, rescue_controller_1.createRescuePost);
router.patch("/update/:id", authMiddleware_1.protect, multerConfig_1.photoUploadConfig.single("image"), multerConfig_1.handleMulterError, rescue_controller_1.updateRescuePost);
router.delete("/del/:id", authMiddleware_1.protect, rescue_controller_1.delRescuePost);
exports.default = router;
