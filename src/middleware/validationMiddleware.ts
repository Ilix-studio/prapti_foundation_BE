// middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

// Generic validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Blog validation rules
export const validateBlogCreate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("category")
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
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

export const validateBlogUpdate = [
  param("id").isMongoId().withMessage("Invalid blog ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("content").optional().trim(),
  body("category")
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
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

export const validateBlogId = [
  param("id").isMongoId().withMessage("Invalid blog ID"),
];

// Auth validation rules
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Cloudinary signature validation
export const validateCloudinarySignature = [
  body("folder").optional().isString().withMessage("Folder must be a string"),
];
