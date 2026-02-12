import React from "react";
import { Check, Copy } from "lucide-react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

const normalizeWallets = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (data && data._id) return [data];
  return [];
};

export default function Deposit() {
  const [wallets, setWallets] = React.useState([]);
  const [walletId, setWalletId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [history, setHistory] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);
  const [copiedAddress, setCopiedAddress] = React.useState("");

  const loadWallets = React.useCallback(async () => {
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
  }, []);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await api.get("/transactions/my-history", {
        params: { type: "deposit", page, limit },
      });
      setHistory(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch {
      setHistory([]);
      setTotal(0);
    }
  }, [page, limit]);

  React.useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const selectedWallet = wallets.find((wallet) => wallet._id === walletId);

  const handleCopyAddress = async () => {
    const address = selectedWallet?.address;
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(""), 1500);
    } catch {
      setCopiedAddress("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!txHash.trim()) {
      setError("Transaction hash is required.");
      return;
    }
    if (!walletId) {
      setError("Please select a wallet.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions/deposit", {
        amount: Number(amount),
        txHash,
        walletId,
      });
      setMessage("Deposit request submitted.");
      setAmount("");
      setTxHash("");
      setPage(1);
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Deposit request failed.");
    } finally {
      setLoading(false);
    }
  };

  const pageRows = history;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Deposit</h2>
        <p className="text-sm text-slate-400">
          Send funds to a wallet below and submit your transaction hash.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Wallet</p>
        <div className="mt-3 space-y-3">
          <select
            value={walletId}
            onChange={(event) => setWalletId(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-white focus:outline-none"
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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-300">
            <span className="truncate">{selectedWallet?.address || "-"}</span>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
            >
              {copiedAddress === selectedWallet?.address ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      >
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Amount
          </label>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            placeholder="Enter amount"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
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
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Submitting..." : "Submit Deposit"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Deposit History</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-[#0b0c0d] text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No deposits yet.
                  </td>
                </tr>
              ) : (
                pageRows.map((tx) => (
                  <tr key={tx._id} className="border-b border-white/10 last:border-none">
                    <td className="px-4 py-3">${tx.amount}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tx.walletName || "-"}
                    </td>
                    <td className="px-4 py-3 capitalize">{tx.status}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
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
