import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function MyInvestments() {
  const [investments, setInvestments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState(null);
  const [actionMessage, setActionMessage] = React.useState("");
  const [actionError, setActionError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      const res = await api.get("/investments/my", {
        params: { page, limit },
      });
      setInvestments(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(res.data?.total || 0);
    } catch {
      setInvestments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleRoiWithdraw = async (investment) => {
    setActionError("");
    setActionMessage("");

    const available = Number(investment?.availableInterest || 0);
    if (available < 100) {
      setActionError("Available ROI must be at least $100 to request withdrawal.");
      return;
    }

    const input = window.prompt(
      `Enter ROI withdrawal amount (max ${available.toFixed(2)}):`,
      available.toFixed(2),
    );
    if (input === null) return;

    const amount = Number(input);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Please enter a valid amount.");
      return;
    }

    setActionLoadingId(investment._id);
    try {
      const res = await api.post("/investments/roi/withdraw", {
        investmentId: investment._id,
        amount,
      });
      setActionMessage(res?.data?.message || "ROI withdrawal request submitted.");
      await load();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to submit ROI withdrawal.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">My Investments</h2>
        <p className="text-sm text-slate-400">
          Track active and completed plans.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {actionError ? <p className="mb-4 text-sm text-rose-400">{actionError}</p> : null}
        {actionMessage ? <p className="mb-4 text-sm text-emerald-400">{actionMessage}</p> : null}

        {loading ? (
          <PageLoader message="Loading investments..." rows={4} />
        ) : investments.length === 0 ? (
          <p className="text-sm text-slate-400">No investments yet.</p>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{inv.planName}</p>
                  <p className="text-xs text-slate-500">
                    {inv.durationDays} days • ROI {inv.roi}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Daily interest: ${Number(inv.dailyInterest || 0).toFixed(2)} •
                    Available ROI: ${Number(inv.availableInterest || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Next ROI withdrawal: {inv.nextRoiWithdrawalAt ? new Date(inv.nextRoiWithdrawalAt).toLocaleString() : "Now"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${inv.amount}</p>
                  <p className="text-xs text-slate-500 capitalize">{inv.status}</p>
                  <button
                    type="button"
                    onClick={() => handleRoiWithdraw(inv)}
                    disabled={actionLoadingId === inv._id || Number(inv.availableInterest || 0) < 100}
                    className="mt-2 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoadingId === inv._id ? "Submitting..." : "Withdraw ROI"}
                  </button>
                </div>
              </div>
            ))}
            <Pagination
              total={total}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
