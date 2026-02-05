"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptchaV2 = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const verifyRecaptchaV2 = async (req, res, next) => {
    const token = req.body.recaptchaToken;
    // Bypass in development
    if (process.env.NODE_ENV === "development" || token === "dev-bypass") {
        logger_1.default.info("reCAPTCHA bypassed in development mode");
        next();
        return;
    }
    if (!token) {
        res.status(400).json({
            success: false,
            message: "reCAPTCHA token is required",
        });
        return;
    }
    try {
        const response = await axios_1.default.post("https://www.google.com/recaptcha/api/siteverify", null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY_V2,
                response: token,
            },
        });
        if (!response.data.success) {
            logger_1.default.warn("reCAPTCHA verification failed", {
                errors: response.data["error-codes"],
            });
            res.status(400).json({
                success: false,
                message: "reCAPTCHA verification failed",
                errors: response.data["error-codes"],
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.default.error("reCAPTCHA verification error:", error);
        res.status(500).json({
            success: false,
            message: "reCAPTCHA verification error",
        });
    }
};
exports.verifyRecaptchaV2 = verifyRecaptchaV2;
