import React from "react";
import api from "../../api/axios.js";

export default function KycApproval() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState(null);
  const [rejectingId, setRejectingId] = React.useState(null);
  const [rejectNote, setRejectNote] = React.useState("");
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/kyc/pending");
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (err) {
      setItems([]);
      setError(err?.response?.data?.message || "Failed to load KYC submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id, status, note = "") => {
    setActionId(id);
    setError("");
    try {
      await api.patch(`/admin/kyc/${id}`, { status, note });
      setRejectingId(null);
      setRejectNote("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update KYC status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">KYC Approval</h2>
        <p className="text-sm text-slate-400">
          Review submitted identity documents.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading KYC submissions...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400">No KYC submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-white/10 bg-[#101214] p-4 text-sm text-slate-300"
              >
                <p className="font-semibold text-white">
                  {item.userId?.name || "Unknown user"} ({item.userId?.email || "No email"})
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <a
                    href={item.idDocumentData}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-slate-200 hover:border-white/30"
                  >
                    View ID ({item.idDocumentName})
                  </a>
                  <a
                    href={item.proofOfAddressData}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-slate-200 hover:border-white/30"
                  >
                    View Address Proof ({item.proofOfAddressName})
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(item._id, "approved")}
                    disabled={actionId === item._id}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(item._id);
                      setRejectNote("");
                    }}
                    disabled={actionId === item._id}
                    className="rounded-lg border border-rose-500/70 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:border-rose-400"
                  >
                    Reject
                  </button>
                </div>
                {rejectingId === item._id ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-slate-900/70 p-3">
                    <input
                      value={rejectNote}
                      onChange={(event) => setRejectNote(event.target.value)}
                      placeholder="Reason for rejection"
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(item._id, "rejected", rejectNote)}
                        disabled={!rejectNote.trim() || actionId === item._id}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-70"
                      >
                        Submit Rejection
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectNote("");
                        }}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
