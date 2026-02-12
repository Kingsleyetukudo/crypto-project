import React from "react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function CryptoNews() {
  const [articles, setArticles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/news/crypto", {
          params: { page, limit },
        });
        const list = res.data?.items || [];
        setArticles(list);
        setTotal(res.data?.total || 0);
      } catch {
        setError("Failed to load news.");
        setArticles([]);
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
        <h2 className="text-2xl font-semibold text-white">Crypto News</h2>
        <p className="text-sm text-slate-400">Latest headlines from the market.</p>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {loading ? (
        <PageLoader message="Loading news..." rows={4} />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.url}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {article.source?.name || "News"}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                  {article.description}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm text-emerald-300 hover:text-emerald-200"
                >
                  Read more →
                </a>
              </article>
            ))}
          </div>
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
