"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAdmin = exports.loginAdmin = void 0;
// auth.controller.ts
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Make sure JWT_SECRET has a default value
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret_key";
// Set token expiration (in seconds)
const TOKEN_EXPIRATION = process.env.JWT_EXPIRE_TIME || 30 * 24 * 60 * 60; // 30 days default
/**
 * @desc    Login admin user and generate token
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.loginAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
        res.status(400).json({
            success: false,
            message: "Please provide both email and password",
        });
        return;
    }
    // Find admin by email
    const admin = await adminModel_1.default.findOne({ email }).select("+password");
    // Check if admin exists and password matches
    if (!admin || !(await admin.matchPassword(password))) {
        logger_1.default.info(`Failed login attempt for email: ${email}`);
        res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
        return;
    }
    // Generate token
    const token = admin.getSignedJwtToken();
    // Log successful login
    logger_1.default.info(`Admin logged in: ${admin.email}`);
    // Return success with token
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            token,
        },
    });
});
/**
 * @desc    Logout admin user
 * @route   POST /api/admin/logout
 * @access  Private
 */
exports.logoutAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    // In a token-based auth system, the server doesn't typically "invalidate" JWTs
    // Instead, the client is responsible for discarding the token
    // For enhanced security, you could implement a token blacklist with Redis
    // Here's a simple implementation that acknowledges logout
    // Get admin info from auth middleware
    const admin = req.user;
    if (admin) {
        logger_1.default.info(`Admin logged out: ${admin.email}`);
    }
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});
