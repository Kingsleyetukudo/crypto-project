import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, ChevronDown, Coins, Ellipsis, Sparkles, Wallet } from "lucide-react";
import TransactionTable from "../../components/TransactionTable.jsx";
import DepositModal from "../../components/DepositModal.jsx";
import Pagination from "../../components/Pagination.jsx";
import MarketTickerBar from "../../components/MarketTickerBar.jsx";
import api from "../../api/axios.js";
import profileAvatar from "../../assets/profile-avatar.png";

const getTokenUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return String(decoded?.id || "").trim();
  } catch {
    return "";
  }
};

const yearlyMarketData = [
  { month: "Jan", open: 18000, close: 22000, high: 26000, low: 12000, volume: 40, upper: 40000, lower: 15000 },
  { month: "Feb", open: 22000, close: 14000, high: 28000, low: 8000, volume: 55, upper: 39000, lower: 14000 },
  { month: "Mar", open: 15000, close: 26000, high: 32000, low: 11000, volume: 50, upper: 44000, lower: 17000 },
  { month: "Apr", open: 24000, close: 30000, high: 42000, low: 20000, volume: 58, upper: 43000, lower: 16000 },
  { month: "May", open: 30000, close: 34000, high: 50000, low: 22000, volume: 52, upper: 48000, lower: 20000 },
  { month: "Jun", open: 34000, close: 28000, high: 38000, low: 18000, volume: 62, upper: 50000, lower: 22000 },
  { month: "Jul", open: 28000, close: 42000, high: 52000, low: 24000, volume: 56, upper: 52000, lower: 24000 },
  { month: "Aug", open: 42000, close: 24000, high: 54000, low: 12000, volume: 66, upper: 50000, lower: 21000 },
  { month: "Sep", open: 24000, close: 22000, high: 28000, low: 20000, volume: 48, upper: 47000, lower: 19000 },
  { month: "Oct", open: 22000, close: 54000, high: 60000, low: 18000, volume: 70, upper: 53000, lower: 22000 },
  { month: "Nov", open: 54000, close: 40000, high: 52000, low: 35000, volume: 60, upper: 51000, lower: 20000 },
  { month: "Dec", open: 24000, close: 26000, high: 43000, low: 21000, volume: 46, upper: 50000, lower: 18000 },
];

const weeklyMarketData = [
  { month: "W1", open: 32000, close: 33600, high: 35000, low: 30400, volume: 38, upper: 34200, lower: 31800 },
  { month: "W2", open: 33600, close: 32800, high: 34400, low: 31600, volume: 42, upper: 34600, lower: 32000 },
  { month: "W3", open: 32800, close: 34800, high: 35600, low: 32200, volume: 40, upper: 35200, lower: 32400 },
  { month: "W4", open: 34800, close: 34000, high: 35800, low: 33200, volume: 36, upper: 35500, lower: 32600 },
  { month: "W5", open: 34000, close: 36200, high: 37000, low: 33600, volume: 44, upper: 36000, lower: 33200 },
  { month: "W6", open: 36200, close: 35600, high: 37200, low: 34600, volume: 46, upper: 36500, lower: 33600 },
  { month: "W7", open: 35600, close: 37400, high: 38200, low: 35000, volume: 49, upper: 36800, lower: 33800 },
  { month: "W8", open: 37400, close: 36800, high: 38600, low: 36000, volume: 45, upper: 37200, lower: 34000 },
  { month: "W9", open: 36800, close: 37800, high: 39000, low: 36200, volume: 41, upper: 37600, lower: 34400 },
  { month: "W10", open: 37800, close: 37000, high: 38800, low: 36400, volume: 39, upper: 37800, lower: 34600 },
  { month: "W11", open: 37000, close: 38400, high: 39600, low: 36600, volume: 43, upper: 38200, lower: 35000 },
  { month: "W12", open: 38400, close: 37600, high: 39200, low: 36800, volume: 40, upper: 38400, lower: 35200 },
];

const dailyMarketData = [
  { month: "D1", open: 37800, close: 38100, high: 38400, low: 37200, volume: 26, upper: 38600, lower: 37400 },
  { month: "D2", open: 38100, close: 37700, high: 38300, low: 37400, volume: 24, upper: 38500, lower: 37300 },
  { month: "D3", open: 37700, close: 38500, high: 38900, low: 37600, volume: 29, upper: 38700, lower: 37400 },
  { month: "D4", open: 38500, close: 38200, high: 38800, low: 37900, volume: 27, upper: 38800, lower: 37500 },
  { month: "D5", open: 38200, close: 39000, high: 39400, low: 38100, volume: 32, upper: 39000, lower: 37600 },
  { month: "D6", open: 39000, close: 38600, high: 39200, low: 38200, volume: 31, upper: 39100, lower: 37700 },
  { month: "D7", open: 38600, close: 39200, high: 39600, low: 38400, volume: 34, upper: 39300, lower: 37800 },
  { month: "D8", open: 39200, close: 38800, high: 39500, low: 38500, volume: 28, upper: 39400, lower: 37900 },
  { month: "D9", open: 38800, close: 39500, high: 39900, low: 38700, volume: 35, upper: 39500, lower: 38000 },
  { month: "D10", open: 39500, close: 39100, high: 39800, low: 38900, volume: 30, upper: 39600, lower: 38100 },
  { month: "D11", open: 39100, close: 39700, high: 40100, low: 39000, volume: 33, upper: 39800, lower: 38200 },
  { month: "D12", open: 39700, close: 39300, high: 40000, low: 39100, volume: 29, upper: 39900, lower: 38300 },
];

const monthlyMarketData = [
  { month: "M1", open: 25000, close: 28000, high: 31000, low: 22000, volume: 43, upper: 33000, lower: 23000 },
  { month: "M2", open: 28000, close: 27000, high: 30000, low: 25000, volume: 39, upper: 32500, lower: 23500 },
  { month: "M3", open: 27000, close: 32000, high: 35000, low: 26000, volume: 47, upper: 34000, lower: 24000 },
  { month: "M4", open: 32000, close: 30000, high: 34500, low: 28500, volume: 44, upper: 33800, lower: 24500 },
  { month: "M5", open: 30000, close: 34500, high: 37000, low: 29000, volume: 50, upper: 35000, lower: 25000 },
  { month: "M6", open: 34500, close: 33500, high: 36000, low: 31500, volume: 48, upper: 35500, lower: 25500 },
  { month: "M7", open: 33500, close: 36000, high: 38500, low: 32500, volume: 52, upper: 36200, lower: 26000 },
  { month: "M8", open: 36000, close: 34000, high: 38200, low: 33200, volume: 46, upper: 36500, lower: 26500 },
  { month: "M9", open: 34000, close: 37500, high: 39800, low: 33600, volume: 53, upper: 37000, lower: 27000 },
  { month: "M10", open: 37500, close: 36000, high: 39000, low: 35000, volume: 49, upper: 37200, lower: 27500 },
  { month: "M11", open: 36000, close: 38800, high: 41000, low: 35500, volume: 54, upper: 37800, lower: 28000 },
  { month: "M12", open: 38800, close: 37000, high: 40200, low: 36000, volume: 51, upper: 38000, lower: 28500 },
];

const marketDatasets = {
  daily: dailyMarketData,
  weekly: weeklyMarketData,
  monthly: monthlyMarketData,
  yearly: yearlyMarketData,
};

const COIN_OPTIONS = [
  { symbol: "BTC", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "SOL", label: "Solana" },
  { symbol: "XRP", label: "Ripple" },
  { symbol: "ADA", label: "Cardano" },
  { symbol: "DOGE", label: "Dogecoin" },
];

export default function UserDashboard() {
  const [showDeposit, setShowDeposit] = React.useState(false);
  const [quickDepositAmount, setQuickDepositAmount] = React.useState("");
  const [profile, setProfile] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [transactionsPage, setTransactionsPage] = React.useState(1);
  const [transactionsLimit, setTransactionsLimit] = React.useState(10);
  const [transactionsTotal, setTransactionsTotal] = React.useState(0);
  const [newsItems, setNewsItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refCopied, setRefCopied] = React.useState(false);
  const [referralSummary, setReferralSummary] = React.useState(null);
  const [activeRange, setActiveRange] = React.useState("yearly");
  const [activeSymbol, setActiveSymbol] = React.useState("BTC");
  const [marketCandles, setMarketCandles] = React.useState([]);
  const tokenUserId = React.useMemo(() => getTokenUserId(), []);

  const fetchProfile = React.useCallback(async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  }, []);

  const fetchTransactions = React.useCallback(async () => {
    const response = await api.get("/transactions/my-history", {
      params: { page: transactionsPage, limit: transactionsLimit },
    });
    return response.data || {};
  }, [transactionsLimit, transactionsPage]);

  const fetchNews = React.useCallback(async () => {
    const response = await api.get("/news/crypto", {
      params: { page: 1, limit: 4 },
    });
    return response.data || {};
  }, []);

  const refreshData = React.useCallback(async () => {
    setLoading(true);
    const [profileRes, txRes, newsRes, referralRes] = await Promise.allSettled([
      fetchProfile(),
      fetchTransactions(),
      fetchNews(),
      api.get("/users/referrals").then((res) => res.data || null),
    ]);

    const profileData = profileRes.status === "fulfilled" ? profileRes.value : null;
    const transactionData = txRes.status === "fulfilled" ? txRes.value : {};
    const newsData = newsRes.status === "fulfilled" ? newsRes.value : {};
    const referralData = referralRes.status === "fulfilled" ? referralRes.value : null;

    setProfile(profileData);
    setReferralSummary(referralData);
    setTransactions(Array.isArray(transactionData?.items) ? transactionData.items : []);
    setTransactionsTotal(Number(transactionData?.total) || 0);
    setNewsItems(Array.isArray(newsData?.items) ? newsData.items : []);
    setLoading(false);
  }, [fetchNews, fetchProfile, fetchTransactions]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  React.useEffect(() => {
    let isMounted = true;

    const labelForCandle = (timestamp, range) => {
      const date = new Date(timestamp);
      if (range === "daily") {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      if (range === "weekly") {
        return date.toLocaleDateString([], { weekday: "short" });
      }
      if (range === "monthly") {
        return date.toLocaleDateString([], { month: "short", day: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short" });
    };

    const buildBands = (candles) => {
      const period = 5;
      return candles.map((item, index) => {
        const start = Math.max(0, index - period + 1);
        const window = candles.slice(start, index + 1);
        const avg =
          window.reduce((sum, candle) => sum + candle.close, 0) / window.length;
        const variance =
          window.reduce((sum, candle) => sum + (candle.close - avg) ** 2, 0) /
          window.length;
        const stdDev = Math.sqrt(variance);
        return {
          ...item,
          upper: avg + stdDev * 2,
          lower: Math.max(0, avg - stdDev * 2),
        };
      });
    };

    const loadCandles = async () => {
      try {
        const limitByRange = {
          daily: 24,
          weekly: 42,
          monthly: 30,
          yearly: 52,
        };
        const res = await api.get("/market/candles", {
          params: {
            symbol: activeSymbol,
            range: activeRange,
            limit: limitByRange[activeRange] || 52,
          },
        });
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        const normalized = items
          .filter(
            (item) =>
              Number(item.open) > 0 &&
              Number(item.high) > 0 &&
              Number(item.low) > 0 &&
              Number(item.close) > 0,
          )
          .map((item) => ({
            month: labelForCandle(item.timestamp, activeRange),
            open: Number(item.open),
            close: Number(item.close),
            high: Number(item.high),
            low: Number(item.low),
            volume: Number(item.volume) || 0,
          }));

        if (!isMounted) return;
        if (normalized.length > 1) {
          setMarketCandles(buildBands(normalized));
          return;
        }
        setMarketCandles([]);
      } catch {
        if (!isMounted) return;
        setMarketCandles([]);
      }
    };

    loadCandles();

    return () => {
      isMounted = false;
    };
  }, [activeRange, activeSymbol]);

  const totalAssets = Number(profile?.totalAssets ?? profile?.balance ?? 0);
  const totalDeposits = Number(profile?.totalDeposits ?? 0);
  const totalBalance = Number(profile?.balance ?? 0);
  const apy = Number(profile?.apy ?? 0);

  const tableRows = transactions.map((tx) => ({
    id: tx._id || tx.id,
    type: tx.type,
    amount: tx.amount,
    status: tx.status,
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—",
  }));

  const refCode = String(
    referralSummary?.referralCode || profile?.referralCode || profile?.id || tokenUserId || "",
  ).trim().toUpperCase();
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const referralLink = refCode ? `${baseUrl}/ref/${refCode}` : "";

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 1500);
    } catch {
      setRefCopied(false);
    }
  };

  const handleQuickDeposit = () => {
    const numericAmount = Number(quickDepositAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }
    setShowDeposit(true);
  };

  const chartData =
    marketCandles.length > 1
      ? marketCandles
      : marketDatasets[activeRange] || yearlyMarketData;
  const minPrice = Math.min(...chartData.map((p) => p.low));
  const maxPrice = Math.max(...chartData.map((p) => p.high));
  const pricePad = Math.max(1000, Math.round((maxPrice - minPrice) * 0.12));
  const yMin = Math.max(0, minPrice - pricePad);
  const yMax = maxPrice + pricePad;
  const volumeMax = Math.max(...chartData.map((p) => p.volume), 1);
  const tickCount = 6;
  const tickStep = (yMax - yMin) / tickCount;
  const priceTicks = Array.from({ length: tickCount + 1 }, (_, idx) =>
    Math.round(yMin + tickStep * idx),
  );
  const svgWidth = 860;
  const svgHeight = 360;
  const chartLeft = 56;
  const chartRight = 18;
  const chartTop = 20;
  const chartBottom = 56;
  const volumeHeight = 46;
  const bodyWidth = 9;
  const plotHeight = svgHeight - chartTop - chartBottom - volumeHeight;
  const plotWidth = svgWidth - chartLeft - chartRight;
  const step = chartData.length > 1 ? plotWidth / (chartData.length - 1) : plotWidth;
  const xAxisStride = Math.max(
    1,
    Math.ceil(chartData.length / (activeRange === "yearly" ? 12 : 8)),
  );

  const yForPrice = (value) => {
    const ratio = (value - yMin) / (yMax - yMin || 1);
    return chartTop + (1 - ratio) * plotHeight;
  };

  const yForVolume = (value) => {
    const base = chartTop + plotHeight + 6 + volumeHeight;
    return base - (value / volumeMax) * volumeHeight;
  };

  const buildLinePath = (key) =>
    chartData
      .map((point, index) => {
        const x = chartLeft + index * step;
        const y = yForPrice(point[key]);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <div className="grid gap-8 overflow-x-hidden lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6 overflow-hidden">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent p-6 shadow-[0_20px_60px_-40px_rgba(52,211,153,0.7)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                Premium access
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Upgrade your plan to Premium and get unlimited access
              </h2>
            </div>
            <button className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">
              Upgrade Now
            </button>
          </div>
        </div>

        <MarketTickerBar />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-amber-400/90 p-5 text-slate-950">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em]">
              <span>Total Assets</span>
              <Coins className="h-4 w-4" />
            </div>
            <p className="mt-4 text-2xl font-semibold">
              ${totalAssets.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-amber-900/70">
              {loading ? "Loading..." : "Wallet + active investments"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>Total Deposits</span>
              <Wallet className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">
              ${totalDeposits.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">All time</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>APY</span>
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">
              +{apy.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">Avg. yield</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111317] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <select
                value={activeSymbol}
                onChange={(event) => setActiveSymbol(event.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-[#1b1e23] px-3 py-2 pr-8 text-sm text-white focus:outline-none"
              >
                {COIN_OPTIONS.map((coin) => (
                  <option key={coin.symbol} value={coin.symbol}>
                    {coin.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center rounded-lg border border-white/10 bg-[#1b1e23] p-1">
                <button
                  type="button"
                  onClick={() => setActiveRange("daily")}
                  className={`rounded-md px-3 py-1.5 ${activeRange === "daily" ? "bg-white/10 text-white" : "text-slate-500"}`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRange("weekly")}
                  className={`rounded-md px-3 py-1.5 ${activeRange === "weekly" ? "bg-white/10 text-white" : "text-slate-500"}`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRange("monthly")}
                  className={`rounded-md px-3 py-1.5 ${activeRange === "monthly" ? "bg-white/10 text-white" : "text-slate-500"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRange("yearly")}
                  className={`rounded-md px-3 py-1.5 ${activeRange === "yearly" ? "bg-white/10 text-white" : "text-slate-500"}`}
                >
                  Yearly
                </button>
              </div>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-[#1b1e23] text-slate-300">
                <Ellipsis className="h-4 w-4" />
              </button>
              <button type="button" className="flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-[#1b1e23] px-3 text-slate-200">
                <CalendarDays className="h-3.5 w-3.5" />
                Select Date
              </button>
              <button type="button" className="h-8 rounded-lg bg-amber-500 px-3 font-semibold text-white hover:bg-amber-400">
                Trade {activeSymbol}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-[#0d0f12] p-3">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-auto min-w-[760px] w-full">
              {priceTicks.map((tick) => {
                const y = yForPrice(tick);
                return (
                  <g key={tick}>
                    <line x1={chartLeft} y1={y} x2={svgWidth - chartRight} y2={y} stroke="rgba(148,163,184,0.12)" />
                    <text x={8} y={y + 4} fill="#64748b" fontSize="12">
                      {tick === 0 ? "0" : `${Math.round(tick / 1000)}k`}
                    </text>
                  </g>
                );
              })}

              <path d={buildLinePath("upper")} fill="none" stroke="rgba(99,102,241,0.45)" strokeWidth="1.8" />
              <path d={buildLinePath("lower")} fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="1.4" />

              {chartData.map((point, index) => {
                const x = chartLeft + index * step;
                const yOpen = yForPrice(point.open);
                const yClose = yForPrice(point.close);
                const yHigh = yForPrice(point.high);
                const yLow = yForPrice(point.low);
                const up = point.close >= point.open;
                const bodyY = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
                const volumeY = yForVolume(point.volume);
                const volumeBase = chartTop + plotHeight + 6 + volumeHeight;

                return (
                  <g key={point.month}>
                    <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.1" />
                    <rect x={x - bodyWidth / 2} y={bodyY} width={bodyWidth} height={bodyHeight} rx="1" fill={up ? "#22c55e" : "#ef4444"} />
                    <rect x={x - bodyWidth / 2} y={volumeY} width={bodyWidth} height={Math.max(2, volumeBase - volumeY)} fill="rgba(148,163,184,0.18)" />
                  </g>
                );
              })}

              {chartData
                .map((point, index) => ({ point, index }))
                .filter(
                  ({ index }) =>
                    index === 0 ||
                    index === chartData.length - 1 ||
                    index % xAxisStride === 0,
                )
                .map(({ point, index }) => {
                  const x = chartLeft + index * step;
                  return (
                    <text
                      key={`${point.month}-${index}`}
                      x={x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="12"
                    >
                      {point.month}
                    </text>
                  );
                })}
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Latest Crypto News
                </h3>
                <p className="text-xs text-slate-500">
                  Market headlines and updates
                </p>
              </div>
              <a
                href="/news"
                className="text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                View all
              </a>
            </div>

            {newsItems.length === 0 ? (
              <p className="text-sm text-slate-500">
                {loading ? "Loading news..." : "No news available right now."}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {newsItems.slice(0, 4).map((article, index) => (
                  <article
                    key={article?.url || `${article?.title || "news"}-${index}`}
                    className="rounded-xl border border-white/10 bg-[#0f1216] p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                      {article?.source?.name || "News"}
                    </p>
                    <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-white">
                      {article?.title || "Untitled"}
                    </h4>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {article?.description || "No summary available."}
                    </p>
                    {article?.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
                      >
                        Read
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <TransactionTable rows={tableRows} />
          <Pagination
            total={transactionsTotal}
            page={transactionsPage}
            setPage={setTransactionsPage}
            limit={transactionsLimit}
            setLimit={setTransactionsLimit}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <img
            src={profileAvatar}
            alt="Profile"
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
          <h3 className="mt-4 text-xl font-semibold">
            {profile?.name || "David Chen"}
          </h3>
          <p className="text-sm text-slate-500">
            {profile?.email || "devchen@gmail.com"}
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111317] p-4 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Total Balance
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ${totalBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b1d22] to-[#14161a] p-6">
          <p className="text-sm font-semibold text-amber-200">
            Account Security
          </p>
          <p className="text-xs text-slate-500">Security Message</p>
          <p className="mt-4 text-sm text-slate-200">
            Hello {profile?.firstName || "there"}, you need to secure your
            account with 2 factor authentication.
          </p>
          <button className="mt-6 w-full rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300">
            Secure Now
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b1d22] to-[#14161a] p-6">
          <p className="text-sm font-semibold text-amber-200">
            Referral Program
          </p>
          <p className="text-xs text-slate-500">
            Invite friends and earn rewards
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#101214] p-3 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Your Referral Link
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0c0d] px-3 py-2">
              <span className="truncate text-xs text-slate-400">
                {referralLink || "Referral link unavailable"}
              </span>
              <button
                onClick={handleCopyReferral}
                disabled={!referralLink}
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-amber-400 hover:text-amber-200"
              >
                {refCopied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-white">
                {Number(
                  referralSummary?.totalReferrals
                    ?? (Array.isArray(referralSummary?.items) ? referralSummary.items.length : undefined)
                    ?? profile?.totalReferrals
                    ?? 0,
                ) || 0}
              </p>
              <p className="text-xs text-slate-500">Total Referrals</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                ${(Number(referralSummary?.referralEarnings) || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-slate-500">Referral Earnings</p>
            </div>
          </div>
          <Link
            to="/referrals"
            className="mt-6 block w-full rounded-full bg-amber-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-amber-300"
          >
            View All Referrals
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b1d22] to-[#14161a] p-6">
          <p className="text-sm font-semibold text-amber-200">
            Quick Transaction
          </p>
          <p className="text-xs text-slate-500">Do a quick transaction</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#101214] px-4 py-3">
            <input
              value={quickDepositAmount}
              onChange={(event) => setQuickDepositAmount(event.target.value)}
              placeholder="Enter Deposit Amount"
              type="number"
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          <button
            onClick={handleQuickDeposit}
            className="mt-6 w-full rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
          >
            Deposit
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">
              Buy
            </button>
            <button className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400">
              Sell
            </button>
            <button className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400">
              Send
            </button>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Coin
              </p>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-[#101214] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-400/20 text-amber-300">
                    ₿
                  </span>
                  <div>
                    <p className="font-semibold">Bitcoin</p>
                    <p className="text-xs text-slate-500">BTC</p>
                  </div>
                </div>
                <span className="text-slate-500">▾</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Amount
              </p>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-[#101214] px-4 py-3">
                <span className="font-semibold">$2,745.10</span>
                <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
                  USD
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-semibold">$2,745.10</span>
            </div>
            <button
              onClick={() => {
                setQuickDepositAmount("");
                setShowDeposit(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
            >
              Buy BTC
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onSubmitted={refreshData}
          initialAmount={quickDepositAmount}
        />
      )}
    </div>
  );
}

