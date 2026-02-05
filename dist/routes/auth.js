"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const seeder_1 = __importDefault(require("../adminPriviledge/seeder"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const recaptchaMiddleware_1 = require("../middleware/recaptchaMiddleware");
const router = express_1.default.Router();
// Seed admin - should be protected in production
// Only allow in development mode
if (process.env.NODE_ENV === "development") {
    router.post("/seed", seeder_1.default);
}
// Admin login with validation
router.post("/login", validationMiddleware_1.validateLogin, recaptchaMiddleware_1.verifyRecaptchaV2, auth_controller_1.loginAdmin);
// Admin logout
router.post("/logout", authMiddleware_1.protect, auth_controller_1.logoutAdmin);
exports.default = router;
