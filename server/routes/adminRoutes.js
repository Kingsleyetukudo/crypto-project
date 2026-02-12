import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { withPagination } from "../middleware/pagination.js";
import {
  approveTransaction,
  createAdminInvestment,
  createAdminWallet,
  createInvestmentPlan,
  deleteAdminInvestment,
  deleteInvestmentPlan,
  getAdminHistory,
  getAdminInvestments,
  getAdminWallets,
  getInvestmentPlans,
  getPendingByType,
  getPendingTransactions,
  getUserInvestments,
  getUsers,
  updateAdminInvestment,
  updateAdminWallet,
  updateInvestmentPlan,
  updateTransaction,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/transactions/pending", protect, adminOnly, withPagination(), getPendingTransactions);
router.get("/pending", protect, adminOnly, withPagination(), getPendingByType);
router.patch("/approve/:id", protect, adminOnly, approveTransaction);
router.patch("/transactions/:id", protect, adminOnly, updateTransaction);

router.get("/wallets", protect, adminOnly, withPagination(), getAdminWallets);
router.post("/wallets", protect, adminOnly, createAdminWallet);
router.patch("/wallets/:id", protect, adminOnly, updateAdminWallet);

router.get("/investments", protect, adminOnly, withPagination(), getAdminInvestments);
router.post("/investments", protect, adminOnly, createAdminInvestment);
router.patch("/investments/:id", protect, adminOnly, updateAdminInvestment);
router.delete("/investments/:id", protect, adminOnly, deleteAdminInvestment);

router.get("/investment-plans", protect, adminOnly, withPagination(), getInvestmentPlans);
router.post("/investment-plans", protect, adminOnly, createInvestmentPlan);
router.patch("/investment-plans/:id", protect, adminOnly, updateInvestmentPlan);
router.delete("/investment-plans/:id", protect, adminOnly, deleteInvestmentPlan);

router.get("/user-investments", protect, adminOnly, withPagination(), getUserInvestments);
router.get("/users", protect, adminOnly, withPagination(), getUsers);
router.get("/history", protect, adminOnly, withPagination(), getAdminHistory);

export default router;
