import React from "react";

export default function AdminSettings() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-white">Admin Settings</h2>
      <p className="mt-2 text-sm text-slate-400">
        Configure admin-level preferences and security options for the console.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Alerts
          </p>
          <p className="mt-2 text-sm text-slate-300">
            In-app alerts are enabled for deposits, withdrawals, and KYC actions.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Security
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Use strong credentials and rotate access tokens regularly.
          </p>
        </div>
      </div>
    </section>
  );
}
