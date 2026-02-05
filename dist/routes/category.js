"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/category.ts
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const router = express_1.default.Router();
// Public routes
router.get("/:type", rateLimitMiddleware_1.apiLimiter, categoryController_1.getCategoriesByType);
// Protected routes (Admin only)
router.use(authMiddleware_1.protect);
router.get("/", categoryController_1.getAllCategories);
router.post("/", categoryController_1.createCategory);
router.put("/:id", categoryController_1.updateCategory);
router.delete("/:id", categoryController_1.deleteCategory);
exports.default = router;
