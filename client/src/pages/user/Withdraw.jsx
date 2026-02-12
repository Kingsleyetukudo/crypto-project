import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

export default function Withdraw() {
  const [amount, setAmount] = React.useState("");
  const [destinationAddress, setDestinationAddress] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [history, setHistory] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await api.get("/transactions/my-history", {
        params: { type: "withdrawal", page, limit },
      });
      setHistory(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch {
      setHistory([]);
      setTotal(0);
    }
  }, [page, limit]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!destinationAddress.trim()) {
      setError("Destination address is required.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions/withdraw", {
        amount: Number(amount),
        destinationAddress,
      });
      setMessage("Withdrawal request submitted.");
      setAmount("");
      setDestinationAddress("");
      setPage(1);
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Withdrawal request failed.");
    } finally {
      setLoading(false);
    }
  };

  const pageRows = history;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Withdraw</h2>
        <p className="text-sm text-slate-400">
          Request a withdrawal to your wallet address.
        </p>
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
            Destination Address
          </label>
          <input
            value={destinationAddress}
            onChange={(event) => setDestinationAddress(event.target.value)}
            placeholder="Wallet address"
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
          {loading ? "Submitting..." : "Submit Withdrawal"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Withdrawal History</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-[#0b0c0d] text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No withdrawals yet.
                  </td>
                </tr>
              ) : (
                pageRows.map((tx) => (
                  <tr key={tx._id} className="border-b border-white/10 last:border-none">
                    <td className="px-4 py-3">${tx.amount}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tx.destinationAddress || "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{tx.status}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString()
                        : "—"}
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
