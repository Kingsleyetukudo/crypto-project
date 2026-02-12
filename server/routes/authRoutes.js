import express from "express";
import { protect } from "../middleware/auth.js";
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  requestPasswordChangeOtp,
  register,
  resetPassword,
  sendRegistrationOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-otp", sendRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password/request-otp", protect, requestPasswordChangeOtp);
router.put("/change-password", protect, changePassword);

export default router;
