import express from "express";

import { loginAdmin, logoutAdmin } from "../controllers/auth.controller";
import seedAdmin from "../adminPriviledge/seeder";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Seed admin
router.post("/seed", seedAdmin);

// login admin
router.post("/login", loginAdmin);

// Admin logout
router.post("/logout", protect, logoutAdmin);

export default router;
