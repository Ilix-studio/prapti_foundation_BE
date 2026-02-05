"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/contact.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const contact_controller_1 = require("../controllers/contact.controller");
const recaptchaMiddleware_1 = require("../middleware/recaptchaMiddleware");
const router = express_1.default.Router();
// Public routes
router.post("/send", recaptchaMiddleware_1.verifyRecaptchaV2, rateLimitMiddleware_1.formLimiter, // Rate limit contact form submissions
contact_controller_1.sendMessage);
// Protected routes (Admin only)
router.get("/get", authMiddleware_1.protect, contact_controller_1.getMessages);
router.get("/:id", authMiddleware_1.protect, contact_controller_1.getMessageById);
router.patch("/:id/read", authMiddleware_1.protect, contact_controller_1.markAsRead);
router.delete("/:id", authMiddleware_1.protect, contact_controller_1.deleteMessage);
exports.default = router;
