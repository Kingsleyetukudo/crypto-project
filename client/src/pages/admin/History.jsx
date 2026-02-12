import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

export default function History() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/history", {
          params: { page, limit },
        });
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setTotal(res.data?.total || 0);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, limit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Admin History</h2>
        <p className="text-sm text-slate-400">All platform transactions.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-400"
                  >
                    Loading history...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                items.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-6 py-4 font-semibold text-white">
                      {tx.userId?.name || tx.userId?.email || "Unknown"}
                    </td>
                    <td className="px-6 py-4 capitalize">{tx.type}</td>
                    <td className="px-6 py-4">${tx.amount}</td>
                    <td className="px-6 py-4 capitalize">{tx.status}</td>
                    <td className="px-6 py-4 text-slate-400">
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
