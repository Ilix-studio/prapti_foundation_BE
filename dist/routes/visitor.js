"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const visitorController_1 = require("../controllers/visitorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const router = express_1.default.Router();
// Public routes - for visitor tracking
router.post("/increment-counter", rateLimitMiddleware_1.apiLimiter, visitorController_1.incrementVisitorCount);
router.get("/visitor-count", rateLimitMiddleware_1.apiLimiter, visitorController_1.getVisitorCount);
// Protected routes (Admin only) - for dashboard analytics
router.use(authMiddleware_1.protect); // All routes below require authentication
// Admin dashboard analytics
router.get("/stats", visitorController_1.getVisitorStats);
router.post("/reset", visitorController_1.resetVisitorCount);
exports.default = router;
