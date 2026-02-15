import React from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import Logo from "../../assets/Goldchain-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      const role = res.data?.user?.role;
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <img src={Logo} alt="Goldchain logo" className="w-28" />
            <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
              Secure Access
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Welcome back to your crypto command center.
            </h1>
            <p className="text-sm text-slate-400">
              Monitor balances, track profits, and request withdrawals with a
              single login.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your credentials to continue.
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
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Password
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
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

              {error && <p className="text-sm text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Forgot password?</span>
              <Link to="/forgot-password" className="text-amber-400 hover:text-amber-300">
                Reset via OTP
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              New here?{" "}
              <Link to="/register" className="text-amber-400 hover:text-amber-300">
                Create an account
              </Link>
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Back to{" "}
              <Link to="/" className="text-amber-400 hover:text-amber-300">
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

