import express from "express";
import {
  createAwardPost,
  delAwardPost,
  getAwardPost,
  getByIdAwardPost,
  updateAwardPost,
} from "../controllers/award.controller";
import { protect } from "../middleware/authMiddleware";
const router = express.Router();

router.post("/create", protect, createAwardPost);

router.get("/get", getAwardPost);
router.get("/get/:id", getByIdAwardPost);
router.patch("/update/:id", updateAwardPost);
router.delete("/del/:id", delAwardPost);

export default router;
