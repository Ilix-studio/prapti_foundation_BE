"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/testimonials.ts
const express_1 = __importDefault(require("express"));
const testimonialController_1 = require("../controllers/testimonialController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const recaptchaMiddleware_1 = require("../middleware/recaptchaMiddleware");
const router = express_1.default.Router();
// Public routes
router.get("/", rateLimitMiddleware_1.apiLimiter, testimonialController_1.getTestimonials);
router.get("/active", rateLimitMiddleware_1.apiLimiter, testimonialController_1.getActiveTestimonials);
router.get("/featured", rateLimitMiddleware_1.apiLimiter, testimonialController_1.getFeaturedTestimonials);
router.get("/:id", rateLimitMiddleware_1.apiLimiter, testimonialController_1.getTestimonialById); //no component
// Protected routes (Admin only)
router.get("/admin/stats", testimonialController_1.getTestimonialStats);
router.post("/", recaptchaMiddleware_1.verifyRecaptchaV2, rateLimitMiddleware_1.formLimiter, testimonialController_1.createTestimonial); //admin cant post only public
router.put("/:id", authMiddleware_1.protect, testimonialController_1.updateTestimonial);
router.delete("/:id", authMiddleware_1.protect, testimonialController_1.deleteTestimonial);
exports.default = router;
