import React from "react";

export default function PageLoader({
  message = "Loading...",
  rows = 3,
  compact = false,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-300" />
        <span>{message}</span>
      </div>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-xl border border-white/10 bg-[#101214]"
          />
        ))}
      </div>
    </div>
  );
}
