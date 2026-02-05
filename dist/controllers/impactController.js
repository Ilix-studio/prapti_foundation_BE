"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImpactStatistics = exports.deleteTotalImpact = exports.updateTotalImpact = exports.getLatestTotalImpact = exports.getTotalImpactById = exports.getAllTotalImpact = exports.createTotalImpact = void 0;
// src/controllers/totalImpact.controller.ts
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const logger_1 = __importDefault(require("../utils/logger"));
const totalImpact_1 = require("../models/totalImpact");
/**
 * @desc    Create new total impact record
 * @route   POST /api/total-impact
 * @access  Private (Admin only)
 */
exports.createTotalImpact = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { dogsRescued, dogsAdopted, volunteers } = req.body;
    // Validation
    if (dogsRescued < 0 || dogsAdopted < 0 || volunteers < 0) {
        res.status(400).json({
            success: false,
            message: "All counts must be non-negative numbers",
        });
        return;
    }
    if (dogsAdopted > dogsRescued) {
        res.status(400).json({
            success: false,
            message: "Dogs adopted cannot exceed dogs rescued",
        });
        return;
    }
    // Create total impact record
    const totalImpact = await totalImpact_1.TotalImpactModel.create({
        dogsRescued,
        dogsAdopted,
        volunteers,
    });
    logger_1.default.info(`New total impact record created with ID: ${totalImpact._id}`);
    res.status(201).json({
        success: true,
        message: "Total impact record created successfully",
        data: totalImpact,
    });
});
/**
 * @desc    Get all total impact records
 * @route   GET /api/total-impact
 * @access  Public
 */
exports.getAllTotalImpact = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { page = 1, limit = 10, isActive } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // Build filter query
    let filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }
    const totalImpacts = await totalImpact_1.TotalImpactModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
    const totalRecords = await totalImpact_1.TotalImpactModel.countDocuments(filter);
    res.status(200).json({
        success: true,
        data: totalImpacts,
        pagination: {
            current: pageNumber,
            pages: Math.ceil(totalRecords / limitNumber),
            total: totalRecords,
            limit: limitNumber,
        },
    });
});
/**
 * @desc    Get single total impact record by ID
 * @route   GET /api/total-impact/:id
 * @access  Public
 */
exports.getTotalImpactById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            success: false,
            message: "Invalid total impact record ID format",
        });
        return;
    }
    const totalImpact = await totalImpact_1.TotalImpactModel.findById(id);
    if (!totalImpact) {
        res.status(404).json({
            success: false,
            message: "Total impact record not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: totalImpact,
    });
});
/**
 * @desc    Get latest total impact record
 * @route   GET /api/total-impact/latest
 * @access  Public
 */
exports.getLatestTotalImpact = (0, express_async_handler_1.default)(async (req, res, next) => {
    const latestImpact = await totalImpact_1.TotalImpactModel.findOne({
        isActive: true,
    }).sort({ createdAt: -1 });
    if (!latestImpact) {
        res.status(404).json({
            success: false,
            message: "No active total impact record found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: latestImpact,
    });
});
/**
 * @desc    Update total impact record
 * @route   PUT /api/total-impact/:id
 * @access  Private (Admin only)
 */
exports.updateTotalImpact = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { dogsRescued, dogsAdopted, volunteers, isActive } = req.body;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            success: false,
            message: "Invalid total impact record ID format",
        });
        return;
    }
    // Validation
    if (dogsRescued < 0 || dogsAdopted < 0 || volunteers < 0) {
        res.status(400).json({
            success: false,
            message: "All counts must be non-negative numbers",
        });
        return;
    }
    if (dogsAdopted > dogsRescued) {
        res.status(400).json({
            success: false,
            message: "Dogs adopted cannot exceed dogs rescued",
        });
        return;
    }
    const updatedImpact = await totalImpact_1.TotalImpactModel.findByIdAndUpdate(id, { dogsRescued, dogsAdopted, volunteers, isActive }, { new: true, runValidators: true });
    if (!updatedImpact) {
        res.status(404).json({
            success: false,
            message: "Total impact record not found",
        });
        return;
    }
    logger_1.default.info(`Total impact record updated: ${id}`);
    res.status(200).json({
        success: true,
        message: "Total impact record updated successfully",
        data: updatedImpact,
    });
});
/**
 * @desc    Delete total impact record
 * @route   DELETE /api/total-impact/:id
 * @access  Private (Admin only)
 */
exports.deleteTotalImpact = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            success: false,
            message: "Invalid total impact record ID format",
        });
        return;
    }
    const deletedImpact = await totalImpact_1.TotalImpactModel.findByIdAndDelete(id);
    if (!deletedImpact) {
        res.status(404).json({
            success: false,
            message: "Total impact record not found",
        });
        return;
    }
    logger_1.default.info(`Total impact record deleted: ${id}`);
    res.status(200).json({
        success: true,
        message: "Total impact record deleted successfully",
        data: deletedImpact,
    });
});
/**
 * @desc    Get impact statistics
 * @route   GET /api/total-impact/stats
 * @access  Public
 */
exports.getImpactStatistics = (0, express_async_handler_1.default)(async (req, res, next) => {
    const stats = await totalImpact_1.TotalImpactModel.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalDogsRescued: { $sum: "$dogsRescued" },
                totalDogsAdopted: { $sum: "$dogsAdopted" },
                totalVolunteers: { $sum: "$volunteers" },
                avgAdoptionRate: {
                    $avg: {
                        $cond: [
                            { $eq: ["$dogsRescued", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$dogsAdopted", "$dogsRescued"] },
                                    100,
                                ],
                            },
                        ],
                    },
                },
                recordCount: { $sum: 1 },
            },
        },
    ]);
    const statistics = stats[0] || {
        totalDogsRescued: 0,
        totalDogsAdopted: 0,
        totalVolunteers: 0,
        avgAdoptionRate: 0,
        recordCount: 0,
    };
    res.status(200).json({
        success: true,
        data: {
            ...statistics,
            avgAdoptionRate: Math.round(statistics.avgAdoptionRate * 100) / 100,
        },
    });
});
