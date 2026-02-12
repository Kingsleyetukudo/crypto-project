import express from "express";
import { withPagination } from "../middleware/pagination.js";
import {
  getMarketCandles,
  getDerivativesMarket,
  getForexRates,
  getMarketTicker,
  getMarketTrades,
  getSpotMarket,
} from "../controllers/marketController.js";

const router = express.Router();

router.get("/ticker", getMarketTicker);
router.get("/candles", getMarketCandles);
router.get("/trades", getMarketTrades);
router.get("/forex", getForexRates);
router.get("/spot", withPagination(), getSpotMarket);
router.get("/derivatives", withPagination(), getDerivativesMarket);

export default router;
