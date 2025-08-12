// src/controllers/totalImpact.controller.ts
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger";
import { TotalImpactModel } from "../models/totalImpact";

/**
 * @desc    Create new total impact record
 * @route   POST /api/total-impact
 * @access  Private (Admin only)
 */
export const createTotalImpact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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
    const totalImpact = await TotalImpactModel.create({
      dogsRescued,
      dogsAdopted,
      volunteers,
    });

    logger.info(`New total impact record created with ID: ${totalImpact._id}`);

    res.status(201).json({
      success: true,
      message: "Total impact record created successfully",
      data: totalImpact,
    });
  }
);

/**
 * @desc    Get all total impact records
 * @route   GET /api/total-impact
 * @access  Public
 */
export const getAllTotalImpact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, isActive } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter query
    let filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const totalImpacts = await TotalImpactModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalRecords = await TotalImpactModel.countDocuments(filter);

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
  }
);

/**
 * @desc    Get single total impact record by ID
 * @route   GET /api/total-impact/:id
 * @access  Public
 */
export const getTotalImpactById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid total impact record ID format",
      });
      return;
    }

    const totalImpact = await TotalImpactModel.findById(id);

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
  }
);

/**
 * @desc    Get latest total impact record
 * @route   GET /api/total-impact/latest
 * @access  Public
 */
export const getLatestTotalImpact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const latestImpact = await TotalImpactModel.findOne({
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
  }
);

/**
 * @desc    Update total impact record
 * @route   PUT /api/total-impact/:id
 * @access  Private (Admin only)
 */
export const updateTotalImpact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const updatedImpact = await TotalImpactModel.findByIdAndUpdate(
      id,
      { dogsRescued, dogsAdopted, volunteers, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedImpact) {
      res.status(404).json({
        success: false,
        message: "Total impact record not found",
      });
      return;
    }

    logger.info(`Total impact record updated: ${id}`);

    res.status(200).json({
      success: true,
      message: "Total impact record updated successfully",
      data: updatedImpact,
    });
  }
);

/**
 * @desc    Delete total impact record
 * @route   DELETE /api/total-impact/:id
 * @access  Private (Admin only)
 */
export const deleteTotalImpact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid total impact record ID format",
      });
      return;
    }

    const deletedImpact = await TotalImpactModel.findByIdAndDelete(id);

    if (!deletedImpact) {
      res.status(404).json({
        success: false,
        message: "Total impact record not found",
      });
      return;
    }

    logger.info(`Total impact record deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: "Total impact record deleted successfully",
      data: deletedImpact,
    });
  }
);

/**
 * @desc    Get impact statistics
 * @route   GET /api/total-impact/stats
 * @access  Public
 */
export const getImpactStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await TotalImpactModel.aggregate([
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
  }
);
