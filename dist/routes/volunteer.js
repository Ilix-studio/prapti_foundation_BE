"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const volunteer_controller_1 = require("../controllers/volunteer.controller");
const recaptchaMiddleware_1 = require("../middleware/recaptchaMiddleware");
const router = express_1.default.Router();
// POST /api/volunteers/create - create a new volunteer application
//Public
router.post("/create", recaptchaMiddleware_1.verifyRecaptchaV2, volunteer_controller_1.createVolunteer);
// GET /api/volunteers/info - Get volunteer applications
// Private
router.get("/info", authMiddleware_1.protect, volunteer_controller_1.getVolunteerInfo);
// GET /api/volunteers/:id - get volunteer by Id
// Private
router.get("/:id", authMiddleware_1.protect, volunteer_controller_1.getVolunteerById);
// Del /api/volunteers/:id - del volunteer by Id
// Private
router.delete("/:id", authMiddleware_1.protect, volunteer_controller_1.deleteVolunteerForm);
exports.default = router;
