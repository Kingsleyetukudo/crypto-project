import axios from "axios";

const krakenClient = axios.create({
  baseURL: "https://api.kraken.com/0/public",
});

const forexClient = axios.create({
  baseURL: "https://api.frankfurter.dev/v1",
});

const coingeckoClient = axios.create({
  baseURL: process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3",
});

const DEFAULT_SYMBOLS = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE"];
const DEFAULT_FOREX_SYMBOLS = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];

const KRAKEN_PAIR_MAP = {
  BTC: "XBTUSD",
  ETH: "ETHUSD",
  SOL: "SOLUSD",
  XRP: "XRPUSD",
  ADA: "ADAUSD",
  DOGE: "DOGEUSD",
  LTC: "LTCUSD",
  BNB: "BNBUSD",
};

const COINGECKO_ID_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  LTC: "litecoin",
  BNB: "binancecoin",
};

const CANDLE_RANGE_CONFIG = {
  daily: { interval: 60, defaultLimit: 24, maxLimit: 72 },
  weekly: { interval: 240, defaultLimit: 42, maxLimit: 120 },
  monthly: { interval: 1440, defaultLimit: 30, maxLimit: 120 },
  yearly: { interval: 10080, defaultLimit: 52, maxLimit: 104 },
};

const normalizeSymbols = (raw, fallback = DEFAULT_SYMBOLS) => {
  const input = String(raw || "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return input.length ? input : fallback;
};

const toKrakenPair = (symbol) => KRAKEN_PAIR_MAP[symbol] || `${symbol}USD`;

const fromKrakenBaseSymbol = (base) => {
  if (base === "XBT") return "BTC";
  return base;
};

const normalizeTickerResult = (result = {}) =>
  Object.entries(result).map(([pairKey, payload]) => {
    const wsName = payload?.wsname || pairKey;
    const [base] = wsName.split("/");
    const symbol = fromKrakenBaseSymbol(base || pairKey.replace(/USD$/i, ""));

    const lastPrice = Number(payload?.c?.[0] || 0);
    const open24h = Number(payload?.o || 0);
    const changePercent = open24h ? ((lastPrice - open24h) / open24h) * 100 : 0;

    return {
      symbol,
      pair: wsName,
      lastPrice,
      open24h,
      changePercent,
      high24h: Number(payload?.h?.[1] || payload?.h?.[0] || 0),
      low24h: Number(payload?.l?.[1] || payload?.l?.[0] || 0),
      volume24h: Number(payload?.v?.[1] || payload?.v?.[0] || 0),
      quote: "USD",
    };
  });

export const getMarketTicker = async (req, res) => {
  try {
    const symbols = normalizeSymbols(req.query.symbols);
    const ids = symbols
      .map((symbol) => COINGECKO_ID_MAP[symbol])
      .filter(Boolean);

    if (!ids.length) {
      return res.json({ items: [], total: 0 });
    }

    const response = await coingeckoClient.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: ids.join(","),
        price_change_percentage: "24h",
      },
    });

    const items = Array.isArray(response.data)
      ? response.data.map((coin) => ({
          symbol: String(coin?.symbol || "").toUpperCase(),
          pair: `${String(coin?.symbol || "").toUpperCase()}/USD`,
          lastPrice: Number(coin?.current_price || 0),
          open24h: 0,
          changePercent: Number(coin?.price_change_percentage_24h || 0),
          high24h: Number(coin?.high_24h || 0),
          low24h: Number(coin?.low_24h || 0),
          volume24h: Number(coin?.total_volume || 0),
          quote: "USD",
        }))
      : [];

    return res.json({ items, total: items.length });
  } catch (error) {
    return res.status(500).json({
      message:
        error?.response?.data?.error?.[0] ||
        error?.response?.data?.error ||
        "Failed to fetch market ticker",
    });
  }
};

export const getMarketTrades = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "BTC").trim().toUpperCase();
    const pair = toKrakenPair(symbol);
    const count = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const response = await krakenClient.get("/Trades", {
      params: { pair, count },
    });

    if (Array.isArray(response.data?.error) && response.data.error.length > 0) {
      return res.status(502).json({
        message: "Kraken trades returned an error",
        details: response.data.error,
      });
    }

    const result = response.data?.result || {};
    const tradeKey = Object.keys(result).find((key) => key !== "last");
    const rows = Array.isArray(result[tradeKey]) ? result[tradeKey] : [];

    const items = rows.map((row, index) => ({
      id: `${tradeKey || pair}-${index}`,
      price: Number(row?.[0] || 0),
      volume: Number(row?.[1] || 0),
      timestamp: row?.[2] ? new Date(Number(row[2]) * 1000).toISOString() : null,
      side: row?.[3] === "b" ? "buy" : "sell",
      orderType: row?.[4] === "l" ? "limit" : "market",
      pair: tradeKey || pair,
      symbol,
    }));

    return res.json({ items, total: items.length, symbol });
  } catch (error) {
    return res.status(500).json({
      message: error?.response?.data?.error?.[0] || "Failed to fetch market trades",
    });
  }
};

export const getMarketCandles = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "BTC").trim().toUpperCase();
    const pair = toKrakenPair(symbol);
    const range = String(req.query.range || "yearly").trim().toLowerCase();
    const config = CANDLE_RANGE_CONFIG[range] || CANDLE_RANGE_CONFIG.yearly;
    const limit = Math.min(
      Math.max(Number(req.query.limit) || config.defaultLimit, 1),
      config.maxLimit,
    );

    const response = await krakenClient.get("/OHLC", {
      params: { pair, interval: config.interval },
    });

    if (Array.isArray(response.data?.error) && response.data.error.length > 0) {
      return res.status(502).json({
        message: "Kraken candles returned an error",
        details: response.data.error,
      });
    }

    const result = response.data?.result || {};
    const candleKey = Object.keys(result).find((key) => key !== "last");
    const rows = Array.isArray(result[candleKey]) ? result[candleKey] : [];
    const sliced = rows.slice(-limit);

    const items = sliced.map((row) => ({
      timestamp: Number(row?.[0] || 0) * 1000,
      open: Number(row?.[1] || 0),
      high: Number(row?.[2] || 0),
      low: Number(row?.[3] || 0),
      close: Number(row?.[4] || 0),
      vwap: Number(row?.[5] || 0),
      volume: Number(row?.[6] || 0),
      tradeCount: Number(row?.[7] || 0),
    }));

    return res.json({
      items,
      total: items.length,
      symbol,
      pair: candleKey || pair,
      range,
      interval: config.interval,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.response?.data?.error?.[0] || "Failed to fetch market candles",
    });
  }
};

export const getForexRates = async (req, res) => {
  try {
    const base = String(req.query.base || "USD").trim().toUpperCase();
    const symbols = normalizeSymbols(req.query.symbols, DEFAULT_FOREX_SYMBOLS);

    const response = await forexClient.get("/latest", {
      params: {
        base,
        symbols: symbols.join(","),
      },
    });

    const rates = response.data?.rates || {};
    const items = Object.entries(rates).map(([quote, rate]) => ({
      pair: `${base}/${quote}`,
      base,
      quote,
      rate: Number(rate),
    }));

    return res.json({
      items,
      total: items.length,
      date: response.data?.date || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.response?.data?.message || "Failed to fetch forex rates",
    });
  }
};

export const getSpotMarket = async (req, res) => {
  try {
    const symbols = normalizeSymbols(req.query.symbols);
    const pairs = symbols.map(toKrakenPair);
    const { page, limit } = req.pagination;

    const response = await krakenClient.get("/Ticker", {
      params: { pair: pairs.join(",") },
    });

    if (Array.isArray(response.data?.error) && response.data.error.length > 0) {
      return res.status(502).json({
        message: "Kraken ticker returned an error",
        details: response.data.error,
      });
    }

    const allItems = normalizeTickerResult(response.data?.result || {}).map((item) => ({
      symbol: item.symbol,
      pair: item.pair,
      prices: { USD: item.lastPrice },
      changePercent: item.changePercent,
      high24h: item.high24h,
      low24h: item.low24h,
      volume24h: item.volume24h,
    }));

    const total = allItems.length;
    const items = allItems.slice((page - 1) * limit, page * limit);
    return res.json({ items, total, page, limit });
  } catch (error) {
    return res.status(500).json({
      message: error?.response?.data?.error?.[0] || "Failed to fetch spot market",
    });
  }
};

export const getDerivativesMarket = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const symbol = String(req.query.symbol || "BTC").trim().toUpperCase();
    const pair = toKrakenPair(symbol);

    const response = await krakenClient.get("/Trades", {
      params: { pair, count: 100 },
    });

    if (Array.isArray(response.data?.error) && response.data.error.length > 0) {
      return res.status(502).json({
        message: "Kraken trades returned an error",
        details: response.data.error,
      });
    }

    const result = response.data?.result || {};
    const tradeKey = Object.keys(result).find((key) => key !== "last");
    const allItems = (Array.isArray(result[tradeKey]) ? result[tradeKey] : []).map(
      (row, index) => ({
        id: `${tradeKey || pair}-${index}`,
        instrument: tradeKey || pair,
        side: row?.[3] === "b" ? "buy" : "sell",
        price: Number(row?.[0] || 0),
        volume: Number(row?.[1] || 0),
        timestamp: row?.[2] ? new Date(Number(row[2]) * 1000).toISOString() : null,
      }),
    );

    const total = allItems.length;
    const items = allItems.slice((page - 1) * limit, page * limit);
    return res.json({ items, total, page, limit, symbol });
  } catch (error) {
    return res.status(500).json({
      message: error?.response?.data?.error?.[0] || "Failed to fetch derivatives market",
    });
  }
};
