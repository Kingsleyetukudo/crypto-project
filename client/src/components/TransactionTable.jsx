import React from "react";
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";

export default function TransactionTable({ rows = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Last 7 days
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-slate-400"
                >
                  No transactions yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
              const positive = row.type !== "withdrawal";
              const statusColor = row.status === "completed"
                ? "text-emerald-400"
                : row.status === "rejected"
                  ? "text-rose-400"
                  : "text-amber-400";
              return (
                <tr key={row.id} className="border-b border-slate-800 last:border-none">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 capitalize">
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-rose-400" />
                      )}
                      {row.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {positive ? "+" : "-"}${row.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 ${statusColor}`}>
                      <Clock className="h-4 w-4" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.date}</td>
                  <td className="px-6 py-4 text-slate-400">{row.note || "—"}</td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
