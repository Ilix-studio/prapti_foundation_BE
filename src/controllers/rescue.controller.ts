import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

/**
 * @desc    Get all rescue posts
 * @route   GET /api/rescue
 * @access  Public
 */
export const getRescuePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    Create all rescue posts
 * @route   Create /api/rescue
 * @access  Public
 */
export const createRescuePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    Update all rescue posts
 * @route   Update /api/rescue
 * @access  Public
 */
export const updateRescuePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    Delete all rescue posts
 * @route   DEL /api/rescue
 * @access  Public
 */
export const delRescuePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
/**
 * @desc    GetBy all rescue posts
 * @route   GET /api/rescue
 * @access  Public
 */
export const getByIdRescuePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
