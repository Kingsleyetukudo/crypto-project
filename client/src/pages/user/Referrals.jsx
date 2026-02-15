import React from "react";
import api from "../../api/axios.js";

export default function Referrals() {
  const [profile, setProfile] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch {
        setProfile(null);
      }
    };
    load();
  }, []);

  const code = profile?.email ? profile.email.split("@")[0] : "user";
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const link = `${baseUrl}/ref/${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Referrals</h2>
        <p className="text-sm text-slate-400">
          Invite friends and earn rewards.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Your referral link
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-300">
          <span className="flex-1 truncate">{link}</span>
          <button
            onClick={handleCopy}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-amber-400 hover:text-amber-200"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 text-center">
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-lg font-semibold text-white">0</p>
            <p className="text-xs text-slate-500">Total Referrals</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#101214] p-4">
            <p className="text-lg font-semibold text-white">$0.00</p>
            <p className="text-xs text-slate-500">Referral Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

