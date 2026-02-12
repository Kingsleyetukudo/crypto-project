import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function MyInvestments() {
  const [investments, setInvestments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, [page, limit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">My Investments</h2>
        <p className="text-sm text-slate-400">
          Track active and completed plans.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
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
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${inv.amount}</p>
                  <p className="text-xs text-slate-500 capitalize">{inv.status}</p>
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
