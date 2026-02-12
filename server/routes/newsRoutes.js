import express from "express";
import { getCryptoNews } from "../controllers/newsController.js";
import { withPagination } from "../middleware/pagination.js";

const router = express.Router();

router.get("/crypto", withPagination(), getCryptoNews);

export default router;
