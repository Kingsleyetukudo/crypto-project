import React from "react";

export default function KycApproval() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">KYC Approval</h2>
        <p className="text-sm text-slate-400">
          Review submitted identity documents.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">No KYC submissions yet.</p>
      </div>
    </div>
  );
}
