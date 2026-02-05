"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonialStats = exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.getFeaturedTestimonials = exports.getActiveTestimonials = exports.getTestimonialById = exports.getTestimonials = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const testimonialModel_1 = __importDefault(require("../models/testimonialModel"));
/**
 * @desc    Get all testimonials with filtering and pagination
 * @route   GET /api/testimonials
 * @access  Public
 */
exports.getTestimonials = (0, express_async_handler_1.default)(async (req, res) => {
    const { page = "1", limit = "10", search, rate, sortBy = "createdAt", sortOrder = "desc", } = req.query;
    // Build query object
    const query = { isActive: true };
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
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    // Execute query
    const [testimonials, total] = await Promise.all([
        testimonialModel_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .select("-__v"),
        testimonialModel_1.default.countDocuments(query),
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
});
/**
 * @desc    Get testimonial by ID
 * @route   GET /api/testimonials/:id
 * @access  Public
 */
exports.getTestimonialById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const testimonial = await testimonialModel_1.default.findOne({
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
});
/**
 * @desc    Get only active testimonials
 * @route   GET /api/testimonials/active
 * @access  Public
 */
exports.getActiveTestimonials = (0, express_async_handler_1.default)(async (req, res) => {
    const { limit, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    let query = testimonialModel_1.default.find({ isActive: true })
        .sort(sortOptions)
        .select("-__v");
    if (limit) {
        query = query.limit(parseInt(limit));
    }
    const testimonials = await query;
    res.status(200).json({
        success: true,
        data: testimonials,
    });
});
/**
 * @desc    Get featured testimonials (highest rated)
 * @route   GET /api/testimonials/featured
 * @access  Public
 */
exports.getFeaturedTestimonials = (0, express_async_handler_1.default)(async (req, res) => {
    const { limit = "6" } = req.query;
    const testimonials = await testimonialModel_1.default.find({ isActive: true })
        .sort({ rate: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .select("-__v");
    res.status(200).json({
        success: true,
        data: testimonials,
    });
});
/**
 * @desc    Create new testimonial
 * @route   POST /api/testimonials
 * @access  Private/Admin
 */
exports.createTestimonial = (0, express_async_handler_1.default)(async (req, res) => {
    const { quote, name, profession, rate } = req.body;
    // Validate required fields
    if (!quote || !name || !profession || rate === undefined) {
        res.status(400).json({
            success: false,
            message: "All fields are required: quote, name, profession, rate",
        });
        return;
    }
    // Validate rate range
    if (typeof rate !== "number" || rate < 1 || rate > 5) {
        res.status(400).json({
            success: false,
            message: "Rate must be a number between 1 and 5",
        });
        return;
    }
    // Check if testimonial with same name and quote already exists
    const existingTestimonial = await testimonialModel_1.default.findOne({
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
    const testimonial = await testimonialModel_1.default.create({
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
});
/**
 * @desc    Update testimonial
 * @route   PUT /api/testimonials/:id
 * @access  Private/Admin
 */
exports.updateTestimonial = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { quote, name, profession, rate, isActive } = req.body;
    const testimonial = await testimonialModel_1.default.findById(id);
    if (!testimonial) {
        res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
        return;
    }
    // Check for duplicate if name or quote is being updated
    if (name || quote) {
        const duplicateQuery = {};
        if (name)
            duplicateQuery.name = name.trim();
        if (quote)
            duplicateQuery.quote = quote.trim();
        const existingTestimonial = await testimonialModel_1.default.findOne({
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
    if (quote !== undefined)
        testimonial.quote = quote.trim();
    if (name !== undefined)
        testimonial.name = name.trim();
    if (profession !== undefined)
        testimonial.profession = profession.trim();
    if (rate !== undefined)
        testimonial.rate = rate;
    if (isActive !== undefined)
        testimonial.isActive = isActive;
    await testimonial.save();
    res.status(200).json({
        success: true,
        message: "Testimonial updated successfully",
        data: testimonial,
    });
});
/**
 * @desc    Delete testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Private/Admin
 */
exports.deleteTestimonial = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const testimonial = await testimonialModel_1.default.findById(id);
    if (!testimonial) {
        res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
        return;
    }
    await testimonialModel_1.default.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Testimonial deleted successfully",
    });
});
/**
 * @desc    Get testimonial statistics
 * @route   GET /api/testimonials/stats
 * @access  Private/Admin
 */
exports.getTestimonialStats = (0, express_async_handler_1.default)(async (req, res) => {
    const [totalCount, activeCount, ratingStats, recentCount] = await Promise.all([
        testimonialModel_1.default.countDocuments(),
        testimonialModel_1.default.countDocuments({ isActive: true }),
        testimonialModel_1.default.aggregate([
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
        testimonialModel_1.default.countDocuments({
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
});
