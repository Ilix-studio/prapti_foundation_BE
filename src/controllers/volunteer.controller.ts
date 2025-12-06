import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { VolunteerModel } from "../models/volunteer.model";

import logger from "../utils/logger";
import { verifyRecaptcha } from "./reCAPTCHA";

export const createVolunteer = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      district,
      state,
      pincode,
      availability,
      interests,
      experience,
      reason,
      recaptchaToken,
    } = req.body;

    if (!recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA token is required",
      });
      return;
    }

    const verification = await verifyRecaptcha(
      recaptchaToken,
      "volunteer_application"
    );

    if (!verification.success) {
      logger.warn(
        `reCAPTCHA verification failed for email: ${email}, score: ${verification.score}`
      );
      res.status(400).json({
        success: false,
        message: verification.message || "reCAPTCHA verification failed",
      });
      return;
    }

    const existingVolunteer = await VolunteerModel.findOne({ email });
    if (existingVolunteer) {
      res.status(400).json({
        success: false,
        message: "A volunteer application with this email already exists",
      });
      return;
    }

    const volunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      district,
      state,
      pincode,
      availability,
      interests,
      experience,
      reason,
    });

    logger.info(
      `New volunteer application submitted: ${email}, reCAPTCHA score: ${verification.score}`
    );

    res.status(201).json({
      success: true,
      message: "Volunteer application submitted successfully",
      data: {
        id: volunteer._id,
        email: volunteer.email,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        submittedAt: volunteer.submittedAt,
      },
    });
  }
);

export const getVolunteerInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const volunteers = await VolunteerModel.find({})
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await VolunteerModel.countDocuments();

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        current: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total,
        limit: limitNumber,
      },
    });
  }
);

export const getVolunteerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const volunteer = await VolunteerModel.findById(id);

    if (!volunteer) {
      res.status(404).json({
        success: false,
        message: "Volunteer application not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  }
);

export const deleteVolunteerForm = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const volunteer = await VolunteerModel.findById(id);

    if (!volunteer) {
      res.status(404).json({
        success: false,
        message: "Volunteer application not found",
      });
      return;
    }

    await VolunteerModel.findByIdAndDelete(id);

    logger.info(
      `Volunteer application deleted: ${volunteer.email} by ${req.user?.email}`
    );

    res.status(200).json({
      success: true,
      message: "Volunteer application deleted successfully",
    });
  }
);
