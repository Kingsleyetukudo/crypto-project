import React from "react";
import { ArrowDownRight, ArrowUpRight, Bitcoin, Coins, DollarSign } from "lucide-react";

const items = [
  { name: "Bitcoin", symbol: "BTC", price: "43,210", change: 2.4, icon: Bitcoin },
  { name: "Ethereum", symbol: "ETH", price: "2,320", change: -1.1, icon: Coins },
  { name: "USDT", symbol: "USDT", price: "1.00", change: 0.0, icon: DollarSign },
];

export default function PriceTicker() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Live Prices
        </h3>
        <span className="text-xs text-slate-500">Updated moments ago</span>
      </div>
      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          const rising = item.change >= 0;
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                  <Icon className="h-5 w-5 text-slate-200" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">${item.price}</p>
                <p
                  className={`flex items-center justify-end gap-1 text-xs ${
                    rising ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {rising ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(item.change)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
