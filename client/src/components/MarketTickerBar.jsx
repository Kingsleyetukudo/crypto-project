import React from "react";
import api from "../api/axios.js";

const formatPrice = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: amount < 1 ? 4 : 2,
    maximumFractionDigits: amount < 1 ? 6 : 2,
  });
};

const symbolBadge = (symbol) => {
  const code = String(symbol || "").toUpperCase();
  const map = {
    BTC: "₿",
    ETH: "Ξ",
    SOL: "◎",
    XRP: "✕",
    ADA: "A",
    DOGE: "Ð",
  };
  return map[code] || code.slice(0, 1) || "?";
};

export default function MarketTickerBar() {
  const [items, setItems] = React.useState([]);
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      if (active) setStatus("loading");
      try {
        const res = await api.get("/market/ticker", {
          params: { symbols: "BTC,ETH,SOL,XRP,ADA,DOGE" },
        });
        if (!active) return;
        const nextItems = Array.isArray(res.data?.items) ? res.data.items : [];
        if (nextItems.length) {
          setItems(nextItems);
          setStatus("ready");
          return;
        }
        setItems([]);
        setStatus("error");
      } catch {
        if (!active) return;
        setItems([]);
        setStatus("error");
      }
    };

    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!items.length) {
    return (
      <div className="w-full max-w-full overflow-hidden  bg-[#0f1216] px-4 py-3 text-sm text-slate-300">
        {status === "loading"
          ? "Loading market prices..."
          : "Market data unavailable. Check your API connection."}
      </div>
    );
  }

  const scrollingItems = [...items, ...items];

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#0f1216]">
      <div className="ticker-marquee w-full max-w-full px-3 py-2 md:px-4">
        <div className="ticker-track">
          {scrollingItems.map((item, index) => {
            const change = Number(item.changePercent) || 0;
            const positive = change >= 0;
            return (
              <div
                key={`${item.symbol}-${index}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-amber-300 bg-white/5 px-3 py-1 text-xs"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-emerald-200">
                  {symbolBadge(item.symbol)}
                </span>
                <span className="font-semibold text-white">{item.symbol}</span>
                <span className="text-slate-300">
                  ${formatPrice(item.lastPrice)}
                </span>
                <span
                  className={positive ? "text-emerald-300" : "text-rose-300"}
                >
                  {positive ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
