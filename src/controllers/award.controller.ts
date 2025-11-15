import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import CategoryModel from "../models/categoryModel";
import AwardPostModel from "../models/awardModel";

/**
 * @desc    Get all award posts
 * @route   GET /api/awards
 * @access  Public
 */
export const getAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    Create all award posts
 * @route   Create /api/awards
 * @access  Public
 */
export const createAwardPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, category, images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400);
      throw new Error("At least one image is required");
    }

    // Debug logging
    console.log("Received category value:", category, typeof category);

    // Validate category exists and is type "photo"
    if (!category || typeof category !== "string") {
      res.status(400);
      throw new Error("Category is required and must be a string");
    }
    // Try to find by ObjectId first, if that fails, try by name
    let categoryDoc;
    let categoryId = category; // Use a separate variable for the actual ID

    try {
      // First attempt: find by ObjectId
      categoryDoc = await CategoryModel.findOne({
        _id: category,
        type: "award",
      });
    } catch (error) {
      // If ObjectId cast fails, category might be a name instead of ID
      console.log("ObjectId cast failed, trying to find by name:", category);
    }
    // If not found by ID, try to find by name
    if (!categoryDoc) {
      categoryDoc = await CategoryModel.findOne({
        name: category,
        type: "award",
      });

      if (categoryDoc) {
        console.log("Found category by name, using ID:", categoryDoc._id);
        // Update the categoryId variable to use the correct ObjectId
        categoryId = categoryDoc._id.toString();
      }
    }
    if (!categoryDoc) {
      res.status(400);
      throw new Error(
        `Invalid photo category: ${category}. Please ensure the category exists and is of type 'photo'.`
      );
    }
    const award = await AwardPostModel.create({
      title,
      description: description || undefined,
      category: categoryId,
      images,
    });
    await award.populate("category");

    res.status(201).json({
      success: true,
      message: "Award Info created successfully",
      data: award,
    });
  }
);
/**
 * @desc    Update all award posts
 * @route   Update /api/awards
 * @access  Public
 */
export const updateAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    Delete all award posts
 * @route   DEL /api/awards
 * @access  Public
 */
export const delAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    GetBy all award posts
 * @route   GET /api/awards
 * @access  Public
 */
export const getByIdAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
