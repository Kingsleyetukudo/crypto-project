import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function Profits() {
  const [profits, setProfits] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/transactions/my-history", {
          params: { type: "profit", page, limit },
        });
        setProfits(Array.isArray(res.data?.items) ? res.data.items : []);
        setTotal(res.data?.total || 0);
      } catch {
        setProfits([]);
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
        <h2 className="text-2xl font-semibold text-white">Profits</h2>
        <p className="text-sm text-slate-400">Your daily ROI payouts.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <PageLoader message="Loading profits..." rows={4} />
        ) : profits.length === 0 ? (
          <p className="text-sm text-slate-400">No profits yet.</p>
        ) : (
          <div className="space-y-3">
            {profits.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">Profit</p>
                  <p className="text-xs text-slate-500">
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <p className="font-semibold text-amber-300">+${tx.amount}</p>
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

