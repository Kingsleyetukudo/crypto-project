import React from "react";
import api from "../../api/axios.js";
import TransactionTable from "../../components/TransactionTable.jsx";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function History() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/transactions/my-history", {
          params: { page, limit },
        });
        const list = Array.isArray(res.data?.items) ? res.data.items : [];
        const mapped = list.map((tx) => ({
          id: tx._id || tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          date: tx.createdAt
            ? new Date(tx.createdAt).toLocaleDateString()
            : "—",
        }));
        setRows(mapped);
        setTotal(res.data?.total || 0);
      } catch {
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, limit]);

  const pageRows = rows;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">History</h2>
        <p className="text-sm text-slate-400">All deposits, withdrawals, and profits.</p>
      </div>

      {loading ? (
        <PageLoader message="Loading history..." rows={5} />
      ) : (
        <div className="space-y-4">
          <TransactionTable rows={pageRows} />
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
  );
}
