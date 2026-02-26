import React from "react";
import api from "../../api/axios.js";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export default function Kyc() {
  const [idDocument, setIdDocument] = React.useState(null);
  const [proofOfAddress, setProofOfAddress] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState("not_submitted");
  const [latest, setLatest] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users/kyc");
      setLatest(res.data?.item || null);
      setStatus(res.data?.kycStatus || "not_submitted");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load KYC status");
      setLatest(null);
      setStatus("not_submitted");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!idDocument || !proofOfAddress) {
      setError("Please upload both documents.");
      return;
    }
    if (idDocument.size > MAX_FILE_SIZE_BYTES || proofOfAddress.size > MAX_FILE_SIZE_BYTES) {
      setError("Each file must be 8MB or smaller.");
      return;
    }

    setSubmitting(true);
    try {
      const [idDocumentData, proofOfAddressData] = await Promise.all([
        fileToDataUrl(idDocument),
        fileToDataUrl(proofOfAddress),
      ]);

      const res = await api.post("/users/kyc", {
        idDocumentName: idDocument.name,
        idDocumentData,
        proofOfAddressName: proofOfAddress.name,
        proofOfAddressData,
      });

      setMessage(res?.data?.message || "KYC submitted successfully");
      setIdDocument(null);
      setProofOfAddress(null);
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel =
    status === "approved"
      ? "Approved"
      : status === "pending"
        ? "Pending Review"
        : status === "rejected"
          ? "Rejected"
          : "Not Submitted";
  const statusClass =
    status === "approved"
      ? "text-emerald-300"
      : status === "pending"
        ? "text-amber-300"
        : status === "rejected"
          ? "text-rose-300"
          : "text-slate-300";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">KYC Verification</h2>
        <p className="text-sm text-slate-400">
          Upload documents to verify your identity.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      >
        <p className="text-sm text-slate-300">
          Status:{" "}
          <span className={statusClass}>
            {loading ? "Loading..." : statusLabel}
          </span>
        </p>
        {latest?.rejectionNote ? (
          <p className="text-sm text-rose-300">
            Rejection note: {latest.rejectionNote}
          </p>
        ) : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              ID Document
            </p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setIdDocument(event.target.files?.[0] || null)}
              className="mt-3 text-xs text-slate-400"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Proof of Address
            </p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setProofOfAddress(event.target.files?.[0] || null)}
              className="mt-3 text-xs text-slate-400"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || status === "pending"}
          className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Documents"}
        </button>
      </form>
    </div>
  );
}

