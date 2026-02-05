"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
/**
 * @desc    Seed admin user
 * @route   POST /api/admin/seed
 * @access  Public (should be protected in production)
 */
const seedAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await adminModel_1.default.findOne({
            email: "praptiFoundation@gmail.com",
        });
        if (!existingAdmin) {
            // Create admin user
            const admin = await adminModel_1.default.create({
                name: "prapti",
                email: "praptiFoundation@gmail.com",
                password: "admin123",
            });
            // Return success response
            res.status(201).json({
                success: true,
                message: "Admin user created successfully",
                data: {
                    name: admin.name,
                    email: admin.email,
                },
            });
        }
        else {
            // Admin already exists
            res.status(200).json({
                success: true,
                message: "Admin user already exists",
                data: {
                    name: existingAdmin.name,
                    email: existingAdmin.email,
                },
            });
        }
    }
    catch (error) {
        res.status(500);
        throw new Error(`Error seeding admin: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
});
exports.default = seedAdmin;
