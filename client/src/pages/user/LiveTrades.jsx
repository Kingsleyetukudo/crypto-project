import React from "react";
import api from "../../api/axios.js";
import PageLoader from "../../components/PageLoader.jsx";

const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "LTC"];
const FOREX_SYMBOLS = "EUR,GBP,JPY,CAD,AUD,CHF";

const formatNumber = (value, digits = 2) =>
  (Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function LiveTrades() {
  const [symbol, setSymbol] = React.useState("BTC");
  const [ticker, setTicker] = React.useState(null);
  const [trades, setTrades] = React.useState([]);
  const [forex, setForex] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    const load = async ({ initial = false } = {}) => {
      if (initial) {
        setLoading(true);
      } else {
        setUpdating(true);
      }
      setError("");
      try {
        const [tickerRes, tradeRes, forexRes] = await Promise.all([
          api.get("/market/ticker", { params: { symbols: symbol } }),
          api.get("/market/trades", { params: { symbol, limit: 25 } }),
          api.get("/market/forex", {
            params: { base: "USD", symbols: FOREX_SYMBOLS },
          }),
        ]);

        if (!active) return;

        const tickerItem = Array.isArray(tickerRes.data?.items)
          ? tickerRes.data.items[0] || null
          : null;

        setTicker(tickerItem);
        setTrades(Array.isArray(tradeRes.data?.items) ? tradeRes.data.items : []);
        setForex(Array.isArray(forexRes.data?.items) ? forexRes.data.items : []);
      } catch {
        if (!active) return;
        setError("Failed to load market data.");
        if (initial) {
          setTicker(null);
          setTrades([]);
          setForex([]);
        }
      } finally {
        if (!active) return;
        if (initial) {
          setLoading(false);
        } else {
          setUpdating(false);
        }
      }
    };

    load({ initial: true });
    const timer = setInterval(() => load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [symbol]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Trades</h2>
          <p className="text-sm text-slate-400">
            Live ticker, recent trades, and forex rates.
          </p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Selected Crypto
          </label>
          <select
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            className="mt-2 w-40 rounded-xl border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-white focus:outline-none"
          >
            {CRYPTO_OPTIONS.map((coin) => (
              <option key={coin} value={coin}>
                {coin}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {updating && !loading && (
        <p className="text-xs text-slate-500">Updating figures...</p>
      )}

      {loading ? (
        <PageLoader message="Loading market data..." rows={4} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {ticker?.pair || `${symbol}/USD`}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <p className="text-3xl font-semibold text-white">
                ${formatNumber(ticker?.lastPrice, 2)}
              </p>
              <p
                className={`text-sm font-semibold ${
                  Number(ticker?.changePercent) >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {Number(ticker?.changePercent) >= 0 ? "+" : ""}
                {formatNumber(ticker?.changePercent, 2)}%
              </p>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-[#101214] px-3 py-2">
                High 24h: <span className="font-semibold">${formatNumber(ticker?.high24h, 2)}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#101214] px-3 py-2">
                Low 24h: <span className="font-semibold">${formatNumber(ticker?.low24h, 2)}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#101214] px-3 py-2">
                Vol 24h: <span className="font-semibold">{formatNumber(ticker?.volume24h, 4)}</span>
              </div>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
              <div className="mt-4 space-y-2">
                {trades.length === 0 ? (
                  <p className="text-sm text-slate-500">No trades available.</p>
                ) : (
                  trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="grid grid-cols-4 items-center gap-2 rounded-lg border border-white/10 bg-[#101214] px-3 py-2 text-xs text-slate-300"
                    >
                      <span className="font-semibold text-white">
                        ${formatNumber(trade.price, 2)}
                      </span>
                      <span>{formatNumber(trade.volume, 5)}</span>
                      <span
                        className={
                          trade.side === "buy" ? "text-emerald-300" : "text-rose-300"
                        }
                      >
                        {trade.side}
                      </span>
                      <span className="text-right text-slate-500">
                        {trade.timestamp
                          ? new Date(trade.timestamp).toLocaleTimeString()
                          : "-"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="self-start rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">Forex Rates (USD)</h3>
              <div className="mt-4 space-y-2">
                {forex.length === 0 ? (
                  <p className="text-sm text-slate-500">No forex rates available.</p>
                ) : (
                  forex.map((item) => (
                    <div
                      key={item.pair}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#101214] px-3 py-2 text-sm text-slate-300"
                    >
                      <span>{item.pair}</span>
                      <span className="font-semibold text-white">
                        {formatNumber(item.rate, 6)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
