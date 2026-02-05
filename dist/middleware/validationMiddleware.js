"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCloudinarySignature = exports.validateLogin = exports.validateBlogId = exports.validateBlogUpdate = exports.validateBlogCreate = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Blog validation rules
exports.validateBlogCreate = [
    (0, express_validator_1.body)("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),
    (0, express_validator_1.body)("content").trim().notEmpty().withMessage("Content is required"),
    (0, express_validator_1.body)("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
        .isIn([
        "Adoption Stories",
        "Dog Care",
        "Training Tips",
        "Shelter News",
        "Health & Wellness",
        "Rescue Stories",
    ])
        .withMessage("Invalid category"),
    (0, express_validator_1.body)("image").optional().isURL().withMessage("Image must be a valid URL"),
];
exports.validateBlogUpdate = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid blog ID"),
    (0, express_validator_1.body)("title")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),
    (0, express_validator_1.body)("content").optional().trim(),
    (0, express_validator_1.body)("category")
        .optional()
        .trim()
        .isIn([
        "Adoption Stories",
        "Dog Care",
        "Training Tips",
        "Shelter News",
        "Health & Wellness",
        "Rescue Stories",
    ])
        .withMessage("Invalid category"),
    (0, express_validator_1.body)("image").optional().isURL().withMessage("Image must be a valid URL"),
];
exports.validateBlogId = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid blog ID"),
];
// Auth validation rules
exports.validateLogin = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
// Cloudinary signature validation
exports.validateCloudinarySignature = [
    (0, express_validator_1.body)("folder").optional().isString().withMessage("Folder must be a string"),
];
