import express from "express";
import {
  createRescuePost,
  delRescuePost,
  getByIdRescuePost,
  getRescuePost,
  updateRescuePost,
} from "../controllers/rescue.controller";
const router = express.Router();

router.post("/create", createRescuePost);
router.get("/get", getRescuePost);
router.get("/get/:id", getByIdRescuePost);
router.patch("/update/:id", updateRescuePost);
router.delete("/del/:id", delRescuePost);

export default router;
