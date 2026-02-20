import React from "react";
import { Check, Loader2, XCircle } from "lucide-react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

export default function Withdrawals() {
  const [pending, setPending] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [rejectingId, setRejectingId] = React.useState(null);
  const [rejectNote, setRejectNote] = React.useState("");

  const loadPending = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/pending", {
        params: { type: "withdrawal", page, limit },
      });
      const list = Array.isArray(response.data?.items) ? response.data.items : [];
      setPending(list);
      setTotal(response.data?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load withdrawals");
      setPending([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  React.useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleAction = async (id, status, note = "") => {
    setActionId(id);
    setError("");
    try {
      await api.patch(`/admin/approve/${id}`, { status, note });
      setPage(1);
      await loadPending();
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed. Try again.");
    } finally {
      setActionId(null);
      setRejectingId(null);
      setRejectNote("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Withdrawal Approvals</h2>
        <p className="text-sm text-slate-400">
          Approve or reject pending withdrawals.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold">Pending Withdrawals</h3>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {pending.length} requests
          </span>
        </div>
        {error && (
          <div className="border-b border-slate-800 px-6 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Investor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Tx Hash</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-400"
                  >
                    Loading withdrawals...
                  </td>
                </tr>
              ) : pending.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-400"
                  >
                    No pending withdrawals.
                  </td>
                </tr>
              ) : (
                pending.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-6 py-4 font-semibold text-white">
                      {tx.userId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">${tx.amount}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {tx.destinationAddress || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{tx.txHash || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAction(tx._id, "completed")}
                          disabled={actionId === tx._id}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {actionId === tx._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(tx._id);
                            setRejectNote("");
                          }}
                          disabled={actionId === tx._id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-500/70 px-4 py-2 text-xs font-semibold text-rose-200 hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {actionId === tx._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </button>
                      </div>
                      {rejectingId === tx._id ? (
                        <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-slate-950/60 p-3">
                          <input
                            value={rejectNote}
                            onChange={(event) => setRejectNote(event.target.value)}
                            placeholder="Reason for rejection"
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAction(tx._id, "rejected", rejectNote)}
                              disabled={actionId === tx._id || !rejectNote.trim()}
                              className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-70"
                            >
                              Submit Rejection
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectNote("");
                              }}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <Pagination
            total={total}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      </div>
    </div>
  );
}

