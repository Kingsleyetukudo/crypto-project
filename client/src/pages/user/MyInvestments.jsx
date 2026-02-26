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
  const [activeActionInvestmentId, setActiveActionInvestmentId] = React.useState(null);
  const [actionType, setActionType] = React.useState("withdraw");
  const [actionAmount, setActionAmount] = React.useState("");
  const [destinationNetwork, setDestinationNetwork] = React.useState("");
  const [destinationAddress, setDestinationAddress] = React.useState("");

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

  const getInvestmentCompletionState = (investment) =>
    investment?.status === "completed"
    || (investment?.endDate ? new Date() >= new Date(investment.endDate) : false);

  const getMinimumAmount = (investment) => (getInvestmentCompletionState(investment) ? 0.01 : 10);

  const openActionPanel = (investment) => {
    setActionError("");
    setActionMessage("");
    setActiveActionInvestmentId(investment._id);
    setActionType("withdraw");
    setActionAmount(Number(investment?.availableInterest || 0).toFixed(2));
    setDestinationNetwork("");
    setDestinationAddress("");
  };

  const closeActionPanel = () => {
    setActiveActionInvestmentId(null);
    setActionType("withdraw");
    setActionAmount("");
    setDestinationNetwork("");
    setDestinationAddress("");
  };

  const submitRoiAction = async (investment) => {
    setActionError("");
    setActionMessage("");

    const available = Number(investment?.availableInterest || 0);
    const isCompleted = getInvestmentCompletionState(investment);
    const minAmount = getMinimumAmount(investment);
    if (available < minAmount) {
      setActionError(
        isCompleted
          ? "No withdrawable ROI available for this completed investment."
          : "Available ROI must be at least $10 to request withdrawal.",
      );
      return;
    }

    const amount = Number(actionAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Please enter a valid amount.");
      return;
    }
    if (amount < minAmount) {
      setActionError(
        isCompleted
          ? "Please enter an amount greater than $0."
          : "Minimum ROI withdrawal amount is $10.",
      );
      return;
    }
    if (amount > available) {
      setActionError("Amount exceeds available ROI.");
      return;
    }
    if (actionType === "withdraw" && !destinationAddress.trim()) {
      setActionError("Destination address is required for wallet withdrawal.");
      return;
    }

    setActionLoadingId(investment._id);
    try {
      let res;
      if (actionType === "transfer") {
        res = await api.post("/investments/roi/transfer", {
          investmentId: investment._id,
          amount,
        });
      } else {
        res = await api.post("/investments/roi/withdraw", {
          investmentId: investment._id,
          amount,
          destinationNetwork,
          destinationAddress,
        });
      }
      setActionMessage(
        res?.data?.message
          || (actionType === "transfer"
            ? "ROI transferred to main balance."
            : "ROI withdrawal request submitted."),
      );
      closeActionPanel();
      await load();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to submit ROI action.");
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
                    onClick={() => openActionPanel(inv)}
                    disabled={(() => {
                      const minAmount = getMinimumAmount(inv);
                      return actionLoadingId === inv._id || Number(inv.availableInterest || 0) < minAmount;
                    })()}
                    className="mt-2 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoadingId === inv._id ? "Submitting..." : "ROI Actions"}
                  </button>
                </div>
                {activeActionInvestmentId === inv._id ? (
                  <div className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-slate-400">Action</label>
                        <select
                          value={actionType}
                          onChange={(event) => setActionType(event.target.value)}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="withdraw">Withdraw to Wallet</option>
                          <option value="transfer">Transfer to Main Balance</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400">
                          Amount (max {Number(inv.availableInterest || 0).toFixed(2)})
                        </label>
                        <input
                          value={actionAmount}
                          onChange={(event) => setActionAmount(event.target.value)}
                          type="number"
                          min={getMinimumAmount(inv)}
                          max={Number(inv.availableInterest || 0)}
                          step="0.01"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    {actionType === "withdraw" ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-slate-400">Network</label>
                          <input
                            value={destinationNetwork}
                            onChange={(event) => setDestinationNetwork(event.target.value)}
                            placeholder="e.g. TRC20, ERC20, BEP20"
                            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400">Destination Address</label>
                          <input
                            value={destinationAddress}
                            onChange={(event) => setDestinationAddress(event.target.value)}
                            placeholder="Wallet address"
                            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitRoiAction(inv)}
                        disabled={actionLoadingId === inv._id}
                        className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-70"
                      >
                        {actionLoadingId === inv._id ? "Submitting..." : "Submit"}
                      </button>
                      <button
                        type="button"
                        onClick={closeActionPanel}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
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
