import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import CategoryModel from "../models/categoryModel";
import AwardPostModel from "../models/awardModel";
import cloudinary from "../config/cloudinaryConfig";
import logger from "../utils/logger";
import { Types } from "mongoose";

/**
 * @desc    Get all award posts
 * @route   GET /api/awards
 * @access  Public
 */
export const getAwardPost = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const awards = await AwardPostModel.find({})
        .populate("category", "name type")
        .sort({ createdAt: -1 });

      res.status(200).json(awards);
    } catch (error: any) {
      logger.error("Error fetching Award posts:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching Award posts",
        error: error.message,
      });
    }
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

  // Validate required fields
  if (!title || typeof title !== "string") {
    res.status(400);
    throw new Error("Title is required and must be a string");
  }

  if (!category || typeof category !== "string") {
    res.status(400);
    throw new Error("Category is required and must be a string");
  }

  // Find category by ID or name
  let categoryDoc;

  if (Types.ObjectId.isValid(category)) {
    categoryDoc = await CategoryModel.findOne({
      _id: category,
      type: "award",
    });
  }

  if (!categoryDoc) {
    categoryDoc = await CategoryModel.findOne({
      name: category,
      type: "award",
    });
  }

  if (!categoryDoc) {
    res.status(400);
    throw new Error(
      `Invalid award category: ${category}. Category must exist and be of type 'award'.`
    );
  }

  // Upload to Cloudinary
  const uploadResult = await new Promise<any>((resolve, reject) => {
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

  // Create award record
  const award = await AwardPostModel.create({
    images: [
      {
        src: uploadResult.secure_url,
        alt: alt || title,
        cloudinaryPublicId: uploadResult.public_id,
      },
    ],
    title,
    category: categoryDoc._id,
    description: description || undefined,
  });

  await award.populate("category");

  res.status(201).json({
    success: true,
    message: "Award uploaded successfully",
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
/**
 * @desc    Update award post with image management
 * @route   PATCH /api/awards/update/:id
 * @access  Private (Admin only)
 */
export const updateAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, description, category, imageAction, imageIndex, imageAlt } =
      req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid award ID format");
    }

    const award = await AwardPostModel.findById(id);
    if (!award) {
      res.status(404);
      throw new Error("Award post not found");
    }

    // Handle image operations
    if (imageAction) {
      switch (imageAction) {
        case "add":
          if (!req.file) {
            res.status(400);
            throw new Error("No file uploaded for image addition");
          }

          if (award.images.length >= 10) {
            res.status(400);
            throw new Error("Maximum 10 images allowed per award");
          }

          const uploadResult = await new Promise<any>((resolve, reject) => {
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

          award.images.push({
            src: uploadResult.secure_url,
            alt: imageAlt || award.title,
            cloudinaryPublicId: uploadResult.public_id,
          });
          break;

        case "delete":
          const index = parseInt(imageIndex);
          if (isNaN(index) || index < 0 || index >= award.images.length) {
            res.status(400);
            throw new Error("Invalid image index");
          }

          if (award.images.length === 1) {
            res.status(400);
            throw new Error("Cannot delete the last image");
          }

          const imageToDelete = award.images[index];
          try {
            await cloudinary.uploader.destroy(imageToDelete.cloudinaryPublicId);
            logger.info(`Deleted image: ${imageToDelete.cloudinaryPublicId}`);
          } catch (error) {
            logger.error(`Cloudinary deletion failed: ${error}`);
          }

          award.images.splice(index, 1);
          break;

        case "updateAlt":
          const altIndex = parseInt(imageIndex);
          if (
            isNaN(altIndex) ||
            altIndex < 0 ||
            altIndex >= award.images.length
          ) {
            res.status(400);
            throw new Error("Invalid image index");
          }

          if (!imageAlt) {
            res.status(400);
            throw new Error("Alt text is required");
          }

          award.images[altIndex].alt = imageAlt;
          break;

        default:
          res.status(400);
          throw new Error(
            "Invalid image action. Use: add, delete, or updateAlt"
          );
      }
    }

    // Handle category update
    if (category !== undefined) {
      if (!category || typeof category !== "string") {
        res.status(400);
        throw new Error("Category must be a string");
      }

      let categoryDoc;
      try {
        categoryDoc = await CategoryModel.findOne({
          _id: category,
          type: "award",
        });
      } catch (error) {
        // Try by name if ObjectId fails
      }

      if (!categoryDoc) {
        categoryDoc = await CategoryModel.findOne({
          name: category,
          type: "award",
        });
      }

      if (!categoryDoc) {
        res.status(400);
        throw new Error(`Invalid award category: ${category}`);
      }

      award.category = new Types.ObjectId(categoryDoc._id);
    }

    // Update other fields
    if (title !== undefined) award.title = title;
    if (description !== undefined) award.description = description;

    try {
      const updatedAward = await award.save();
      await updatedAward.populate("category", "name type");

      logger.info(`Award updated: ${updatedAward.title}`);

      res.status(200).json({
        success: true,
        message: "Award updated successfully",
        data: updatedAward,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err: any) => err.message
        );
        res.status(400);
        throw new Error(`Validation error: ${validationErrors.join(", ")}`);
      }
      throw error;
    }
  }
);

/**
 * @desc    Delete all award posts
 * @route   DELETE /api/awards/del/:id
 * @access  Private (Admin only)
 */
export const delAwardPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid award ID format");
    }

    const award = await AwardPostModel.findById(id);
    if (!award) {
      res.status(404);
      throw new Error("Award post not found");
    }

    // Delete all images from Cloudinary
    const deletePromises = award.images.map(async (image) => {
      try {
        if (image.cloudinaryPublicId) {
          const deleteResult = await cloudinary.uploader.destroy(
            image.cloudinaryPublicId
          );
          logger.info(
            `Deleted image from Cloudinary: ${image.cloudinaryPublicId}, result: ${deleteResult.result}`
          );
        }
      } catch (cloudinaryError) {
        // Log error but don't fail the deletion
        logger.error(
          `Failed to delete image from Cloudinary: ${cloudinaryError}`
        );
      }
    });

    // Wait for all Cloudinary deletions to complete
    await Promise.allSettled(deletePromises);

    // Delete from database
    await AwardPostModel.findByIdAndDelete(id);

    logger.info(`Award post deleted: ${award.title}`);

    res.status(200).json({
      success: true,
      message: "Award post deleted successfully",
    });
  }
);
