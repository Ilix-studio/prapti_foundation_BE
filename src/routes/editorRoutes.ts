import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware";
import { ROLES } from "../constants/roles";
import {
  createEditor,
  getEditors,
  toggleEditorStatus,
  deleteEditor,
  resendEditorCredentials,
} from "../controllers/editor.controller";

const router = Router();

// All editor management is Super-Admin only.
router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.route("/").post(createEditor).get(getEditors);
router.post("/:id/resend-credentials", resendEditorCredentials);
router.patch("/:id/status", toggleEditorStatus);
router.delete("/:id", deleteEditor);

export default router;
