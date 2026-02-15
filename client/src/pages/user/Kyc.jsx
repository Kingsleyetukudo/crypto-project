import React from "react";

export default function Kyc() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">KYC Verification</h2>
        <p className="text-sm text-slate-400">
          Upload documents to verify your identity.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <p className="text-sm text-slate-300">
          Status: <span className="text-amber-300">Not submitted</span>
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              ID Document
            </p>
            <input
              type="file"
              className="mt-3 text-xs text-slate-400"
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Proof of Address
            </p>
            <input type="file" className="mt-3 text-xs text-slate-400" />
          </div>
        </div>
        <button className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300">
          Submit Documents
        </button>
      </div>
    </div>
  );
}

