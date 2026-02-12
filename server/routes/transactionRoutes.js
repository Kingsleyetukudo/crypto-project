import express from "express";
import { protect } from "../middleware/auth.js";
import { withPagination } from "../middleware/pagination.js";
import {
  createDeposit,
  createWithdraw,
  getMyHistory,
  getMyTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/deposit", protect, createDeposit);
router.post("/withdraw", protect, createWithdraw);
router.get("/my-history", protect, withPagination(), getMyHistory);
router.get("/me", protect, withPagination(), getMyTransactions);

export default router;
