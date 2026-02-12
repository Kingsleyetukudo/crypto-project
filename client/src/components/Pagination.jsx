import React from "react";

export default function Pagination({
  total,
  page,
  setPage,
  limit,
  setLimit,
  limits = [5, 10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goTo = (next) => {
    const value = Math.min(Math.max(1, next), totalPages);
    setPage(value);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-[#0b0c0d] px-2 py-1 text-xs text-slate-200 focus:outline-none"
        >
          {limits.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(page - 1)}
          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => goTo(page + 1)}
          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}
