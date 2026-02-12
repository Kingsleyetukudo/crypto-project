import express from "express";
import { protect } from "../middleware/auth.js";
import { withPagination } from "../middleware/pagination.js";
import { getActiveWallets } from "../controllers/walletController.js";

const router = express.Router();

router.get("/", protect, withPagination(), getActiveWallets);

export default router;
