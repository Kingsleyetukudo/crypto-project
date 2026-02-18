import React from "react";
import api from "../../api/axios.js";

const getTokenUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return String(decoded?.id || "").trim();
  } catch {
    return "";
  }
};

export default function Referrals() {
  const [data, setData] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [actionType, setActionType] = React.useState("transfer");
  const [amount, setAmount] = React.useState("100");
  const [destinationAddress, setDestinationAddress] = React.useState("");
  const [destinationNetwork, setDestinationNetwork] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState("");
  const tokenUserId = React.useMemo(() => getTokenUserId(), []);

  const load = React.useCallback(async () => {
    const [profileRes, referralsRes] = await Promise.allSettled([
      api.get("/auth/profile"),
      api.get("/users/referrals"),
    ]);

    const profile =
      profileRes.status === "fulfilled" ? (profileRes.value?.data || null) : null;
    const referrals =
      referralsRes.status === "fulfilled" ? (referralsRes.value?.data || null) : null;

    setData({ profile, referrals });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const code = String(data?.referrals?.referralCode || data?.profile?.referralCode || "")
    .trim()
    .toUpperCase();
  const fallbackCode = String(data?.profile?.id || tokenUserId || "").trim().toUpperCase();
  const shareCode = code || fallbackCode;
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const link = shareCode ? `${baseUrl}/ref/${shareCode}` : "";
  const referrals = Array.isArray(data?.referrals?.items) ? data.referrals.items : [];
  const totalReferrals = Number(
    data?.referrals?.totalReferrals
      ?? referrals.length
      ?? data?.profile?.totalReferrals
      ?? 0,
  ) || 0;
  const referralEarnings = Number(data?.referrals?.referralEarnings) || 0;
  const availableReferralAmount = referralEarnings;
  const canAction = availableReferralAmount >= 100;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleAction = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionMessage("");

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      setActionError("Minimum amount is $100.");
      return;
    }
    if (numericAmount > availableReferralAmount) {
      setActionError("Amount exceeds your referral earnings.");
      return;
    }

    if (actionType === "withdraw" && !destinationAddress.trim()) {
      setActionError("Destination address is required for withdrawal.");
      return;
    }

    setActionLoading(true);
    try {
      if (actionType === "transfer") {
        const res = await api.post("/users/referrals/transfer", { amount: numericAmount });
        setActionMessage(res?.data?.message || "Transfer successful.");
      } else {
        const res = await api.post("/users/referrals/withdraw", {
          amount: numericAmount,
          destinationAddress: destinationAddress.trim(),
          destinationNetwork: destinationNetwork.trim(),
        });
        setActionMessage(res?.data?.message || "Withdrawal request submitted.");
      }
      await load();
      setAmount("100");
      if (actionType === "withdraw") {
        setDestinationAddress("");
        setDestinationNetwork("");
      }
    } catch (err) {
      setActionError(err?.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Referrals</h2>
        <p className="text-sm text-slate-400">
          Invite friends and earn rewards.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Your referral link
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-300">
          <span className="flex-1 truncate">{link || "Referral link unavailable"}</span>
          <button
            onClick={handleCopy}
            disabled={!link}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-amber-400 hover:text-amber-200"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 text-center">
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-lg font-semibold text-white">{totalReferrals}</p>
            <p className="text-xs text-slate-500">Total Referrals</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-lg font-semibold text-white">
              ${referralEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">Referral Earnings</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
          <p className="text-lg font-semibold text-white">
            ${availableReferralAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-500">Available Referral Earnings</p>
        </div>
        <form
          onSubmit={handleAction}
          className="rounded-xl border border-white/10 bg-[#101214] p-4 space-y-3"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Referral Actions (Min $100)
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              <option value="transfer">Transfer to Main Balance</option>
              <option value="withdraw">Withdraw Referral Balance</option>
            </select>
            <input
              type="number"
              min="100"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount (minimum 100)"
              className="rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          {actionType === "withdraw" && (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={destinationAddress}
                onChange={(event) => setDestinationAddress(event.target.value)}
                placeholder="Destination address"
                className="rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <input
                type="text"
                value={destinationNetwork}
                onChange={(event) => setDestinationNetwork(event.target.value)}
                placeholder="Network (optional)"
                className="rounded-lg border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          )}
          {!canAction && (
              <p className="text-sm text-amber-300">
              You need at least $100 in referral earnings before transfer or withdrawal.
            </p>
          )}
          {actionError && <p className="text-sm text-rose-400">{actionError}</p>}
          {actionMessage && <p className="text-sm text-emerald-300">{actionMessage}</p>}
          <button
            type="submit"
            disabled={actionLoading || !canAction}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? "Processing..."
              : actionType === "transfer"
                ? "Transfer to Main Balance"
                : "Submit Withdrawal"}
          </button>
        </form>
        <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            Referred Users
          </p>
          {referrals.length === 0 ? (
            <p className="text-sm text-slate-400">No referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-white">{item.name || item.email}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Deposits</p>
                    <p className="text-amber-300">${Number(item.totalDeposits || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

