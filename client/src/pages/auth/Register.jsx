import React from "react";
import { Eye, EyeOff, Globe, Lock, Mail, User } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import countries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";
import currencyCodes from "currency-codes";
import Logo from "../../assets/Goldchain-logo.png";

const REF_STORAGE_KEY = "pending_referral_code";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { referralCode: referralCodeFromPath } = useParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    country: "",
    currency: "",
    otp: "",
    referralCode: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const countryList = React.useMemo(() => {
    countries.registerLocale(enCountries);
    const names = countries.getNames("en", { select: "official" });
    return Object.entries(names)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const currencyList = React.useMemo(() => {
    const data = Array.isArray(currencyCodes?.data) ? currencyCodes.data : [];
    return data
      .map((item) => ({ code: item.code, name: item.currency }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  React.useEffect(() => {
    const queryCode = new URLSearchParams(location.search).get("ref");
    const stored = localStorage.getItem(REF_STORAGE_KEY) || "";
    const incoming = (referralCodeFromPath || queryCode || stored || "").trim().toUpperCase();
    if (!incoming) {
      return;
    }
    localStorage.setItem(REF_STORAGE_KEY, incoming);
    setForm((prev) => ({ ...prev, referralCode: prev.referralCode || incoming }));
  }, [location.search, referralCodeFromPath]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirm ||
      !form.otp
    ) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const queryCode = new URLSearchParams(location.search).get("ref");
      const directRouteCode = String(referralCodeFromPath || queryCode || "")
        .trim()
        .toUpperCase();
      const res = await api.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        country: form.country,
        currency: form.currency,
        otp: form.otp,
        referralCode:
          form.referralCode
          || localStorage.getItem(REF_STORAGE_KEY)
          || directRouteCode
          || undefined,
      });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      localStorage.removeItem(REF_STORAGE_KEY);
      setMessage("Account created successfully.");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Email is required to receive OTP.");
      return;
    }

    setSendingOtp(true);
    try {
      const queryCode = new URLSearchParams(location.search).get("ref");
      const directRouteCode = String(referralCodeFromPath || queryCode || "")
        .trim()
        .toUpperCase();
      const res = await api.post("/auth/register-otp", {
        email: form.email,
        referralCode:
          form.referralCode
          || localStorage.getItem(REF_STORAGE_KEY)
          || directRouteCode
          || undefined,
      });
      const baseMessage = res?.data?.message || "Registration OTP sent to email.";
      const smtpError = res?.data?.smtpError ? ` (${res.data.smtpError})` : "";
      setMessage(`${baseMessage}${smtpError}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start investing with a secure crypto portfolio.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  First Name
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="Jane"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Last Name
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Doe"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
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
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
                </button>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  OTP
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.otp}
                    onChange={handleChange("otp")}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Referral Code (Optional)
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.referralCode}
                    onChange={handleChange("referralCode")}
                    placeholder="Enter referral code"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Country
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <select
                      value={form.country}
                      onChange={handleChange("country")}
                      className="w-full bg-transparent text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="" className="text-slate-950">
                        Select country
                      </option>
                      {countryList.map((country) => (
                        <option
                          key={country.code}
                          value={country.name}
                          className="text-slate-950"
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Currency
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <select
                      value={form.currency}
                      onChange={handleChange("currency")}
                      className="w-full bg-transparent text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="" className="text-slate-950">
                        Select currency
                      </option>
                      {currencyList.map((currency) => (
                        <option
                          key={currency.code}
                          value={currency.code}
                          className="text-slate-950"
                        >
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </select>
                  </div>
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
                    placeholder="Create a password"
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
                    value={form.confirm}
                    onChange={handleChange("confirm")}
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
              {message && <p className="text-sm text-amber-400">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-400 hover:text-amber-300">
                Sign in
              </Link>
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Back to{" "}
              <Link to="/" className="text-amber-400 hover:text-amber-300">
                Home
              </Link>
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <img src={Logo} alt="Goldchain logo" className="w-28" />
            <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
              Build Wealth
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Start earning daily ROI with curated investment plans.
            </h1>
            <p className="text-sm text-slate-400">
              Register to unlock investment dashboards, transaction history, and
              automated profit tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

