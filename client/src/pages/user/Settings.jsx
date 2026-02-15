import React from "react";
import api from "../../api/axios.js";
import PageLoader from "../../components/PageLoader.jsx";

export default function Settings() {
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState("");
  const [profileError, setProfileError] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [sendingPasswordOtp, setSendingPasswordOtp] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    country: "",
    currency: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/profile");
        const data = res.data || {};
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          country: data.country || "",
          currency: data.currency || "",
          email: data.email || "",
        });
      } catch {
        setProfileError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      await api.put("/auth/profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
        currency: form.currency,
      });
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswordForm = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Current password, new password, and confirm password are required.");
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return false;
    }

    return true;
  };

  const onRequestPasswordOtp = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (!validatePasswordForm()) {
      return;
    }

    setSendingPasswordOtp(true);
    try {
      const response = await api.put("/auth/change-password/request-otp", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(
        response?.data?.message || "Password change OTP sent to email.",
      );
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message || "Failed to send password change OTP.",
      );
    } finally {
      setSendingPasswordOtp(false);
    }
  };

  const onSubmitPassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.otp) {
      setPasswordError("OTP is required.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await api.put("/auth/change-password", {
        otp: passwordForm.otp,
      });
      setPasswordMessage(
        response?.data?.message || "Password changed successfully.",
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-slate-400">Manage your profile settings.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <PageLoader message="Loading settings..." rows={4} />
        ) : (
          <form onSubmit={onSubmitProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Country
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Currency
                </label>
                <input
                  name="currency"
                  value={form.currency}
                  onChange={onChange}
                  placeholder="USD"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {profileError && <p className="text-sm text-rose-400">{profileError}</p>}
            {profileMessage && <p className="text-sm text-amber-400">{profileMessage}</p>}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <p className="text-sm text-slate-400">
            Update your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={onSubmitPassword} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              OTP
            </label>
            <input
              type="text"
              name="otp"
              value={passwordForm.otp}
              onChange={onPasswordChange}
              placeholder="Enter OTP from your email"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-4 py-3 text-sm text-white focus:outline-none"
            />
          </div>

          {passwordError && <p className="text-sm text-rose-400">{passwordError}</p>}
          {passwordMessage && (
            <p className="text-sm text-amber-400">{passwordMessage}</p>
          )}

          <button
            type="button"
            onClick={onRequestPasswordOtp}
            disabled={sendingPasswordOtp}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sendingPasswordOtp ? "Sending OTP..." : "Send Password OTP"}
          </button>

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {changingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

