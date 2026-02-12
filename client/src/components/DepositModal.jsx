import React from "react";
import { Copy, Loader2, X } from "lucide-react";
import api from "../api/axios.js";

const normalizeWallets = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (data && data._id) return [data];
  return [];
};

export default function DepositModal({ onClose, onSubmitted }) {
  const [txHash, setTxHash] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [wallets, setWallets] = React.useState([]);
  const [walletId, setWalletId] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const loadWallets = async () => {
      try {
        const res = await api.get("/wallets", {
          params: { page: 1, limit: 100 },
        });
        const list = normalizeWallets(res.data);
        setWallets(list);
        if (list.length > 0) {
          setWalletId(list[0]._id);
        }
      } catch {
        setWallets([]);
      }
    };
    loadWallets();
  }, []);

  const selectedWallet = wallets.find((wallet) => wallet._id === walletId);

  const handleCopy = async () => {
    try {
      if (!selectedWallet?.address) return;
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!txHash.trim() || !amount) return;
    setSubmitting(true);
    setError("");

    try {
      await api.post("/transactions/deposit", {
        txHash,
        amount: Number(amount),
        walletId,
      });
      setTxHash("");
      setAmount("");
      if (onSubmitted) onSubmitted();
      if (onClose) onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Deposit submission failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Deposit</h2>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800 p-2 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Send funds to the wallet address below, then submit your transaction hash.
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Wallet</p>
          <div className="mt-3 space-y-3">
            <select
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:outline-none"
            >
              {wallets.length === 0 && (
                <option value="">No wallets available</option>
              )}
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name} ({wallet.asset})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-100">
                {selectedWallet?.address || "—"}
              </span>
              <button
                onClick={handleCopy}
                disabled={!selectedWallet?.address}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Amount
            </label>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              type="number"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Transaction Hash
            </label>
            <input
              value={txHash}
              onChange={(event) => setTxHash(event.target.value)}
              placeholder="Paste tx hash"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Deposit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
