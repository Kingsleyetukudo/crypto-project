import React from "react";
import { PiggyBank, Shield, Sparkles } from "lucide-react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

export default function Invest() {
  const [balance, setBalance] = React.useState(0);
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [amount, setAmount] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(9);
  const [total, setTotal] = React.useState(0);

  const loadBalance = React.useCallback(async () => {
    try {
      const response = await api.get("/auth/profile");
      setBalance(Number(response.data?.balance) || 0);
    } catch {
      setBalance(0);
    }
  }, []);

  const loadPlans = React.useCallback(async () => {
    try {
      const res = await api.get("/investments/plans", {
        params: { page, limit },
      });
      setPlans(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(Number(res.data?.total) || 0);
    } catch {
      setPlans([]);
      setTotal(0);
    }
  }, [limit, page]);

  React.useEffect(() => {
    loadBalance();
    loadPlans();
  }, [loadBalance, loadPlans]);

  const handleInvest = async () => {
    if (!selectedPlan) return;
    const numericAmount = Number(amount);

    setMessage("");
    setError("");

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (numericAmount > balance) {
      setError("Insufficient wallet balance for this investment.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/investments/create", {
        planId: selectedPlan._id,
        amount: numericAmount,
      });
      setMessage("Investment created successfully.");
      await loadBalance();
      setSelectedPlan(null);
      setAmount("");
    } catch (err) {
      setError(err?.response?.data?.message || "Investment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Choose Your Plan</h1>
            <p className="text-sm text-slate-400">
              Invest from your wallet balance and earn daily ROI.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Wallet Balance
            </p>
            <p className="text-2xl font-semibold">
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-amber-400/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {plan.name}
                </span>
                <PiggyBank className="h-5 w-5 text-slate-300" />
              </div>
              <p className="mt-6 text-4xl font-semibold text-white">{plan.roi}%</p>
              <p className="text-sm text-slate-400">
                ROI in {plan.durationDays} days
              </p>
              <div className="mt-6 space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  Capital protected
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Auto-compounded
                </div>
              </div>
              <button
                disabled={loading}
                onClick={() => setSelectedPlan(plan)}
                className="mt-8 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Processing..." : "Invest"}
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <p className="text-sm text-slate-400">No investment plans available.</p>
          )}
        </div>
        <Pagination
          total={total}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          limits={[3, 6, 9, 12]}
        />
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0c0d] p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Invest in {selectedPlan.name}
              </h3>
              <button
                onClick={() => setSelectedPlan(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              ROI {selectedPlan.roi}% • {selectedPlan.durationDays} days
            </p>
            <div className="mt-6">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Amount
              </label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                placeholder="Enter amount"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>
            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
            {message && <p className="mt-3 text-sm text-amber-400">{message}</p>}
            <button
              onClick={handleInvest}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Processing..." : "Confirm Investment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

