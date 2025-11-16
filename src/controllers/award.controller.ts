import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import CategoryModel from "../models/categoryModel";
import AwardPostModel from "../models/awardModel";
import cloudinary from "../config/cloudinaryConfig";
import logger from "../utils/logger";

/**
 * @desc    Get all award posts
 * @route   GET /api/awards
 * @access  Public
 */
export const getAwardPost = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 2,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { isActive: true };

    if (category && category !== "all") {
      // Try to resolve category name to ObjectId
      const categoryDoc = await CategoryModel.findOne({
        name: category,
        type: "photo",
      });

      if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid category: ${category}`);
      }

      filter.category = categoryDoc._id;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { "images.alt": { $regex: search, $options: "i" } },
      ];
    }
    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [photos, total] = await Promise.all([
      AwardPostModel.find(filter)
        .populate("category", "name type")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AwardPostModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limitNum);
    res.status(200).json({
      success: true,
      data: {
        photos,
        pagination: {
          current: pageNum,
          pages: totalPages,
          total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  }
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

    // Validate category exists and is type "award"
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
        `Invalid award category: ${category}. Please ensure the category exists and is of type 'award'.`
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
 * Upload single award
 * @route POST /api/awards/upload
 * @access Private (Admin only)
 */
export const uploadAward = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const { alt, title, category, description } = req.body;

  // Validate category exists and is type "award"
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
      // Use the correct ObjectId for database insertion
      categoryId = categoryDoc._id.toString();
    }
  }

  if (!categoryDoc) {
    res.status(400);
    throw new Error(
      `Invalid award category: ${category}. Please ensure the category exists and is of type 'award'.`
    );
  }

  // Upload to Cloudinary
  const cloudinaryResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "prapti-foundation-awards",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(req.file!.buffer);
  });

  const uploadResult = cloudinaryResult as any;

  // Create award record with single image
  const award = await AwardPostModel.create({
    images: [
      {
        src: uploadResult.secure_url,
        alt: alt || title,
        cloudinaryPublicId: uploadResult.public_id,
      },
    ],
    title,
    category: categoryId, // Use the resolved category ID
    description: description || undefined,
  });

  await award.populate("category");

  res.status(201).json({
    success: true,
    message: "award uploaded successfully",
    data: {
      award,
      imagesCount: 1,
    },
  });
});

/**
 * Upload multiple awards to Cloudinary and save to database
 * @route POST /api/awards/upload-multiple
 * @access Private (Admin only)
 */
export const uploadMultipleAwards = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400);
      throw new Error("No files uploaded");
    }

    const files = req.files as Express.Multer.File[];
    const { title, category, description, altTexts } = req.body;

    // Debug logging
    console.log("Received category value:", category, typeof category);

    // Validate category exists and is type "award"
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
        `Invalid award category: ${category}. Please ensure the category exists and is of type 'award'.`
      );
    }

    // Parse altTexts if it's a string
    let altTextsArray: string[] = [];
    if (typeof altTexts === "string") {
      try {
        altTextsArray = JSON.parse(altTexts);
      } catch (error) {
        altTextsArray = [altTexts];
      }
    } else if (Array.isArray(altTexts)) {
      altTextsArray = altTexts;
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file, index) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "prapti-foundation-awards",
              resource_type: "image",
              transformation: [
                { width: 1200, height: 800, crop: "limit" },
                { quality: "auto" },
                { format: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else
                resolve({
                  src: result!.secure_url,
                  alt: altTextsArray[index] || title,
                  cloudinaryPublicId: result!.public_id,
                });
            }
          )
          .end(file.buffer);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Create award record with multiple images
    const award = await AwardPostModel.create({
      images: uploadedImages,
      title,
      category: categoryId, // Use the resolved category ID
      description: description || undefined,
    });

    await award.populate("category", "name type");

    res.status(201).json({
      success: true,
      message: "awards uploaded successfully",
      data: {
        award,
        imagesCount: uploadedImages.length,
      },
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
 * @route   GET /api/awards/:id
 * @access  Public
 */
export const getByIdAwardPost = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Award ID is required",
        });
        return;
      }

      const award = await AwardPostModel.findById(id).populate(
        "category",
        "name type"
      );

      if (!award) {
        res.status(404).json({
          success: false,
          message: "award post not found",
        });
        return;
      }

      res.status(200).json(award);
    } catch (error: any) {
      logger.error("Error fetching award post:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching award post",
        error: error.message,
      });
    }
  }
);
