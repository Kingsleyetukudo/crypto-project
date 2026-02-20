import express from "express";
import { protect } from "../middleware/auth.js";
import { withPagination } from "../middleware/pagination.js";
import {
  createInvestment,
  createRoiWithdrawal,
  getActiveInvestments,
  getMyInvestments,
  getPlans,
} from "../controllers/investmentController.js";

const router = express.Router();

router.get("/plans", protect, withPagination(), getPlans);
router.post("/create", protect, createInvestment);
router.post("/roi/withdraw", protect, createRoiWithdrawal);
router.get("/my", protect, withPagination(), getMyInvestments);
router.get("/active", protect, withPagination(), getActiveInvestments);

export default router;
