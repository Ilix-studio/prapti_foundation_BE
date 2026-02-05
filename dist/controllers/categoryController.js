"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = exports.getCategoriesByType = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const photoModel_1 = __importDefault(require("../models/photoModel"));
const VideoModel_1 = __importDefault(require("../models/VideoModel"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const awardModel_1 = __importDefault(require("../models/awardModel"));
const rescueModel_1 = __importDefault(require("../models/rescueModel"));
/**
 * @desc    Get categories by type
 * @route   GET /api/categories/:type
 * @access  Public
 */
exports.getCategoriesByType = (0, express_async_handler_1.default)(async (req, res) => {
    const { type } = req.params;
    if (!["photo", "video", "blogs", "award", "rescue"].includes(type)) {
        res.status(400);
        throw new Error("Invalid category type");
    }
    const categories = await categoryModel_1.default.find({ type }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        data: categories,
    });
});
/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Private/Admin
 */
exports.getAllCategories = (0, express_async_handler_1.default)(async (req, res) => {
    const categories = await categoryModel_1.default.find().sort({ type: 1, name: 1 });
    res.status(200).json({
        success: true,
        data: categories,
    });
});
/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, type } = req.body;
    const category = await categoryModel_1.default.create({ name, type });
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    });
});
/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name } = req.body;
    const category = await categoryModel_1.default.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }
    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
    });
});
/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const category = await categoryModel_1.default.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }
    // Check if category is being used
    const isUsed = await Promise.all([
        photoModel_1.default.findOne({ category: req.params.id }),
        VideoModel_1.default.findOne({ category: req.params.id }),
        blogModel_1.default.findOne({ category: req.params.id }),
        awardModel_1.default.findOne({ category: req.params.id }),
        rescueModel_1.default.findOne({ category: req.params.id }),
    ]);
    if (isUsed.some((result) => result)) {
        res.status(400);
        throw new Error("Cannot delete category that is currently in use");
    }
    await categoryModel_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
