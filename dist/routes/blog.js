"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("./../middleware/validationMiddleware");
const blogs_controller_1 = require("../controllers/blogs.controller");
const router = express_1.default.Router();
// Public routes
router.get("/getAll", blogs_controller_1.getBlogPost);
router.get("/:id", validationMiddleware_1.validateBlogId, blogs_controller_1.getBlogPostById);
// Protected routes (admin only) with rate limiting and validation
router.post("/create", authMiddleware_1.protect, validationMiddleware_1.validateBlogCreate, blogs_controller_1.createBlogPost);
router.put("/update/:id", authMiddleware_1.protect, validationMiddleware_1.validateBlogUpdate, blogs_controller_1.updateBlogPost);
router.delete("/delete/:id", authMiddleware_1.protect, validationMiddleware_1.validateBlogId, blogs_controller_1.deleteBlogPost);
exports.default = router;
