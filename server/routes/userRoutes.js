import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReferralWithdrawal,
  getMyReferrals,
  transferReferralToMainBalance,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/referrals", protect, getMyReferrals);
router.post("/referrals/transfer", protect, transferReferralToMainBalance);
router.post("/referrals/withdraw", protect, createReferralWithdrawal);

export default router;
