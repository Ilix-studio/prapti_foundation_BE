"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Make sure JWT_SECRET has a default value
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret_key";
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // Check if token exists in Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Get user from token
            req.user = await adminModel_1.default.findById(decoded.id).select("-password");
            if (!req.user) {
                res.status(401);
                throw new Error("User not found with this token");
            }
            next();
        }
        catch (error) {
            console.error("Token verification error:", error);
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }
    else {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});
