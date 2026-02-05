"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVolunteerForm = exports.getVolunteerById = exports.getVolunteerInfo = exports.createVolunteer = void 0;
// backend/controllers/volunteer.controller.ts
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const volunteer_model_1 = require("../models/volunteer.model");
const logger_1 = __importDefault(require("../utils/logger"));
exports.createVolunteer = (0, express_async_handler_1.default)(async (req, res) => {
    const { firstName, lastName, email, phone, address, district, state, pincode, availability, interests, experience, reason, } = req.body;
    // Validation
    if (!firstName || !lastName || !email || !phone) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
        return;
    }
    // Check duplicate
    const existingVolunteer = await volunteer_model_1.VolunteerModel.findOne({ email });
    if (existingVolunteer) {
        res.status(400).json({
            success: false,
            message: "A volunteer application with this email already exists",
        });
        return;
    }
    // Create volunteer
    const volunteer = await volunteer_model_1.VolunteerModel.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: parseInt(phone, 10),
        address: address === null || address === void 0 ? void 0 : address.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: parseInt(pincode, 10),
        availability,
        interests,
        experience: experience === null || experience === void 0 ? void 0 : experience.trim(),
        reason: reason.trim(),
    });
    logger_1.default.info(`New volunteer application: ${email}`);
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
});
exports.getVolunteerInfo = (0, express_async_handler_1.default)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const volunteers = await volunteer_model_1.VolunteerModel.find({})
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limitNumber);
    const total = await volunteer_model_1.VolunteerModel.countDocuments();
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
});
exports.getVolunteerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const volunteer = await volunteer_model_1.VolunteerModel.findById(id);
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
});
exports.deleteVolunteerForm = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const { id } = req.params;
    const volunteer = await volunteer_model_1.VolunteerModel.findById(id);
    if (!volunteer) {
        res.status(404).json({
            success: false,
            message: "Volunteer application not found",
        });
        return;
    }
    await volunteer_model_1.VolunteerModel.findByIdAndDelete(id);
    logger_1.default.info(`Volunteer application deleted: ${volunteer.email} by ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email}`);
    res.status(200).json({
        success: true,
        message: "Volunteer application deleted successfully",
    });
});
