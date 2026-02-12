import React from "react";
import { Check, Loader2, Plus, XCircle } from "lucide-react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

const normalizeWallets = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (data && data._id) return [data];
  return [];
};

export default function AdminDashboard() {
  const [pending, setPending] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [wallets, setWallets] = React.useState([]);
  const [walletForm, setWalletForm] = React.useState({
    name: "",
    address: "",
    asset: "",
    network: "",
  });
  const [pendingPage, setPendingPage] = React.useState(1);
  const [pendingLimit, setPendingLimit] = React.useState(10);
  const [pendingTotal, setPendingTotal] = React.useState(0);
  const [walletPage, setWalletPage] = React.useState(1);
  const [walletLimit, setWalletLimit] = React.useState(10);
  const [walletTotal, setWalletTotal] = React.useState(0);

  const loadPending = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/pending", {
        params: { page: pendingPage, limit: pendingLimit },
      });
      const items = Array.isArray(response.data?.items) ? response.data.items : [];
      setPending(items);
      setPendingTotal(Number(response.data?.total) || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending transactions");
      setPending([]);
      setPendingTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pendingLimit, pendingPage]);

  React.useEffect(() => {
    loadPending();
  }, [loadPending]);

  const loadWallets = React.useCallback(async () => {
    try {
      const response = await api.get("/admin/wallets", {
        params: { page: walletPage, limit: walletLimit },
      });
      const items = normalizeWallets(response.data);
      setWallets(items);
      setWalletTotal(Number(response.data?.total) || items.length);
    } catch {
      setWallets([]);
      setWalletTotal(0);
    }
  }, [walletLimit, walletPage]);

  React.useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const handleAction = async (id, status) => {
    setActionId(id);
    setError("");
    try {
      await api.patch(`/admin/approve/${id}`, { status });
      setPendingPage(1);
      await loadPending();
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed. Try again.");
    } finally {
      setActionId(null);
    }
  };

  const handleWalletChange = (key) => (event) => {
    setWalletForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleAddWallet = async (event) => {
    event.preventDefault();
    setError("");
    if (!walletForm.name || !walletForm.address || !walletForm.asset) {
      setError("Wallet name, address, and asset are required.");
      return;
    }

    try {
      await api.post("/admin/wallets", walletForm);
      setWalletForm({ name: "", address: "", asset: "", network: "" });
      const response = await api.get("/admin/wallets", {
        params: { page: 1, limit: walletLimit },
      });
      const items = normalizeWallets(response.data);
      setWallets(items);
      setWalletTotal(Number(response.data?.total) || items.length);
      setWalletPage(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add wallet.");
    }
  };

  const rows = pending.map((item) => ({
    id: item._id || item.id,
    name: item.userId?.name || item.user?.name || item.userName || "Unknown",
    amount: item.amount,
    type: item.type,
    txHash: item.txHash || "—",
    destinationAddress: item.destinationAddress || "—",
  }));

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold">Admin Console</h1>
          <p className="text-sm text-slate-400">
            Review incoming deposits and keep the ledger clean.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold">Pending Deposits</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {pendingTotal} requests
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
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Tx Hash</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-slate-400"
                    >
                      Loading pending transactions...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-slate-400"
                    >
                      No pending transactions.
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-800 last:border-none"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">${item.amount}</td>
                      <td className="px-6 py-4 capitalize text-slate-300">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{item.txHash}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {item.type === "withdrawal" ? item.destinationAddress : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAction(item.id, "completed")}
                            disabled={actionId === item.id}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {actionId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(item.id, "rejected")}
                            disabled={actionId === item.id}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-500/70 px-4 py-2 text-xs font-semibold text-rose-200 hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {actionId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-800 px-6 py-4">
            <Pagination
              total={pendingTotal}
              page={pendingPage}
              setPage={setPendingPage}
              limit={pendingLimit}
              setLimit={setPendingLimit}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold">Deposit Wallets</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {walletTotal} wallets
            </span>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddWallet} className="grid gap-4 md:grid-cols-2">
              <input
                value={walletForm.name}
                onChange={handleWalletChange("name")}
                placeholder="Wallet name (e.g. USDT)"
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:outline-none"
              />
              <input
                value={walletForm.asset}
                onChange={handleWalletChange("asset")}
                placeholder="Asset (e.g. USDT)"
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:outline-none"
              />
              <input
                value={walletForm.network}
                onChange={handleWalletChange("network")}
                placeholder="Network (optional)"
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:outline-none"
              />
              <input
                value={walletForm.address}
                onChange={handleWalletChange("address")}
                placeholder="Wallet address"
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 md:col-span-2"
              >
                <Plus className="h-4 w-4" />
                Add Wallet
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200"
                >
                  <div>
                    <p className="font-semibold text-white">{wallet.name}</p>
                    <p className="text-xs text-slate-500">
                      {wallet.asset} {wallet.network ? `• ${wallet.network}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{wallet.address}</p>
                </div>
              ))}
              {wallets.length === 0 && (
                <p className="text-sm text-slate-500">No wallets added yet.</p>
              )}
            </div>
            <div className="mt-4">
              <Pagination
                total={walletTotal}
                page={walletPage}
                setPage={setWalletPage}
                limit={walletLimit}
                setLimit={setWalletLimit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
