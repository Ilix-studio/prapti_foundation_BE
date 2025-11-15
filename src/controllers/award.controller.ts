import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

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
  async (req: Request, res: Response, next: NextFunction) => {}
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
