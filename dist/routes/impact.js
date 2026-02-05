"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/totalImpact.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const impactController_1 = require("../controllers/impactController");
const router = express_1.default.Router();
// Public routes
router.get("/", impactController_1.getAllTotalImpact);
router.get("/latest", impactController_1.getLatestTotalImpact);
router.get("/stats", impactController_1.getImpactStatistics);
router.get("/:id", impactController_1.getTotalImpactById);
// Protected routes (Admin only)
router.post("/", authMiddleware_1.protect, rateLimitMiddleware_1.formLimiter, impactController_1.createTotalImpact);
router.put("/:id", authMiddleware_1.protect, impactController_1.updateTotalImpact);
router.delete("/:id", authMiddleware_1.protect, impactController_1.deleteTotalImpact);
exports.default = router;
