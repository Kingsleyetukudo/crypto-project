import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReferralWithdrawal,
  getMyReferrals,
  transferReferralToMainBalance,
} from "../controllers/userController.js";
import {
  getMyKycSubmission,
  submitKyc,
} from "../controllers/kycController.js";

const router = express.Router();

router.get("/referrals", protect, getMyReferrals);
router.post("/referrals/transfer", protect, transferReferralToMainBalance);
router.post("/referrals/withdraw", protect, createReferralWithdrawal);
router.get("/kyc", protect, getMyKycSubmission);
router.post("/kyc", protect, submitKyc);

export default router;
