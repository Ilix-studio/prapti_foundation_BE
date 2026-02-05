"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/cloudinary.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const cloudinaryController_1 = require("../controllers/cloudinaryController");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Routes
router.post("/signature", cloudinaryController_1.generateSignature);
router.delete("/:publicId", cloudinaryController_1.deleteCloudinaryImage);
exports.default = router;
