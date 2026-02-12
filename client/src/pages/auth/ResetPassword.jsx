import React from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import api from "../../api/axios.js";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !otp.trim() || !password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });
      setMessage(res.data?.message || "Password reset successful.");
    } catch (err) {
      setError(err?.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-semibold">Reset password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter the OTP sent to your email and choose a new password.
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
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                OTP Code
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                New Password
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a new password"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Confirm Password
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-200"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Back to{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
