import React from "react";
import { Mail, Send } from "lucide-react";
import api from "../../api/axios.js";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data?.message || "OTP sent to email.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Forgot password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email to receive a 6-digit OTP.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Email
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an OTP?{" "}
            <Link to="/reset-password" className="text-emerald-400 hover:text-emerald-300">
              Reset password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
