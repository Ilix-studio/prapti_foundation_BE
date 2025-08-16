// src/controllers/testimonialController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import TestimonialModel from "../models/testimonialModel";

interface TestimonialQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  rate?: string;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * @desc    Get all testimonials with filtering and pagination
 * @route   GET /api/testimonials
 * @access  Public
 */
export const getTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      search,
      rate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as TestimonialQueryParams;

    // Build query object
    const query: any = { isActive: true };

    // Filter by rating
    if (rate) {
      const rateNum = parseFloat(rate);
      if (!isNaN(rateNum) && rateNum >= 1 && rateNum <= 5) {
        query.rate = rateNum;
      }
    }

    // Search functionality
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const [testimonials, total] = await Promise.all([
      TestimonialModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select("-__v"),
      TestimonialModel.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  }
);

/**
 * @desc    Get testimonial by ID
 * @route   GET /api/testimonials/:id
 * @access  Public
 */
export const getTestimonialById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const testimonial = await TestimonialModel.findOne({
      _id: id,
      isActive: true,
    }).select("-__v");

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  }
);

/**
 * @desc    Get only active testimonials
 * @route   GET /api/testimonials/active
 * @access  Public
 */
export const getActiveTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    let query = TestimonialModel.find({ isActive: true })
      .sort(sortOptions)
      .select("-__v");

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const testimonials = await query;

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  }
);

/**
 * @desc    Get featured testimonials (highest rated)
 * @route   GET /api/testimonials/featured
 * @access  Public
 */
export const getFeaturedTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = "6" } = req.query;

    const testimonials = await TestimonialModel.find({ isActive: true })
      .sort({ rate: -1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .select("-__v");

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  }
);

/**
 * @desc    Create new testimonial
 * @route   POST /api/testimonials
 * @access  Private/Admin
 */
export const createTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { quote, name, profession, rate } = req.body;

    // Check if testimonial with same name and quote already exists
    const existingTestimonial = await TestimonialModel.findOne({
      name: name.trim(),
      quote: quote.trim(),
    });

    if (existingTestimonial) {
      res.status(400).json({
        success: false,
        message: "Testimonial with same name and quote already exists",
      });
      return;
    }

    const testimonial = await TestimonialModel.create({
      quote: quote.trim(),
      name: name.trim(),
      profession: profession.trim(),
      rate,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  }
);

/**
 * @desc    Update testimonial
 * @route   PUT /api/testimonials/:id
 * @access  Private/Admin
 */
export const updateTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quote, name, profession, rate, isActive } = req.body;

    const testimonial = await TestimonialModel.findById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
      return;
    }

    // Check for duplicate if name or quote is being updated
    if (name || quote) {
      const duplicateQuery: any = {};
      if (name) duplicateQuery.name = name.trim();
      if (quote) duplicateQuery.quote = quote.trim();

      const existingTestimonial = await TestimonialModel.findOne({
        ...duplicateQuery,
        _id: { $ne: id },
      });

      if (existingTestimonial) {
        res.status(400).json({
          success: false,
          message: "Testimonial with same name and quote already exists",
        });
        return;
      }
    }

    // Update fields
    if (quote !== undefined) testimonial.quote = quote.trim();
    if (name !== undefined) testimonial.name = name.trim();
    if (profession !== undefined) testimonial.profession = profession.trim();
    if (rate !== undefined) testimonial.rate = rate;
    if (isActive !== undefined) testimonial.isActive = isActive;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  }
);

/**
 * @desc    Delete testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Private/Admin
 */
export const deleteTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const testimonial = await TestimonialModel.findById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
      return;
    }

    await TestimonialModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  }
);

/**
 * @desc    Get testimonial statistics
 * @route   GET /api/testimonials/stats
 * @access  Private/Admin
 */
export const getTestimonialStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [totalCount, activeCount, ratingStats, recentCount] =
      await Promise.all([
        TestimonialModel.countDocuments(),
        TestimonialModel.countDocuments({ isActive: true }),
        TestimonialModel.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rate" },
              maxRating: { $max: "$rate" },
              minRating: { $min: "$rate" },
            },
          },
        ]),
        TestimonialModel.countDocuments({
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    const stats = {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      recentlyAdded: recentCount,
      ratings: ratingStats[0] || {
        averageRating: 0,
        maxRating: 0,
        minRating: 0,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);
