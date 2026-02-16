import React from "react";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import api from "../../api/axios.js";
import Pagination from "../../components/Pagination.jsx";

const emptyForm = {
  name: "",
  roi: "",
  durationDays: "",
  minAmount: "",
  maxAmount: "",
  details: ["", "", "", "", "", ""],
};

export default function Investments() {
  const [plans, setPlans] = React.useState([]);
  const [investments, setInvestments] = React.useState([]);
  const [loadingPlans, setLoadingPlans] = React.useState(true);
  const [loadingInvestments, setLoadingInvestments] = React.useState(true);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  const [menuId, setMenuId] = React.useState(null);
  const [form, setForm] = React.useState(emptyForm);
  const [plansPage, setPlansPage] = React.useState(1);
  const [plansLimit, setPlansLimit] = React.useState(10);
  const [plansTotal, setPlansTotal] = React.useState(0);
  const [investmentsPage, setInvestmentsPage] = React.useState(1);
  const [investmentsLimit, setInvestmentsLimit] = React.useState(10);
  const [investmentsTotal, setInvestmentsTotal] = React.useState(0);

  const loadPlans = React.useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get("/admin/investment-plans", {
        params: { page: plansPage, limit: plansLimit },
      });
      setPlans(Array.isArray(res.data?.items) ? res.data.items : []);
      setPlansTotal(Number(res.data?.total) || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch plans");
      setPlans([]);
      setPlansTotal(0);
    } finally {
      setLoadingPlans(false);
    }
  }, [plansLimit, plansPage]);

  const loadInvestments = React.useCallback(async () => {
    setLoadingInvestments(true);
    try {
      const res = await api.get("/admin/user-investments", {
        params: { page: investmentsPage, limit: investmentsLimit },
      });
      setInvestments(Array.isArray(res.data?.items) ? res.data.items : []);
      setInvestmentsTotal(Number(res.data?.total) || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch investments");
      setInvestments([]);
      setInvestmentsTotal(0);
    } finally {
      setLoadingInvestments(false);
    }
  }, [investmentsLimit, investmentsPage]);

  React.useEffect(() => {
    loadPlans();
    loadInvestments();
  }, [loadPlans, loadInvestments]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditId(plan._id);
    setForm({
      name: plan.name || "",
      roi: plan.roi ?? "",
      durationDays: plan.durationDays ?? "",
      minAmount: plan.minAmount ?? "",
      maxAmount: plan.maxAmount ?? "",
      details: Array.from({ length: 6 }, (_, idx) => plan.details?.[idx] || ""),
    });
    setShowModal(true);
    setMenuId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name || !form.roi || !form.durationDays) {
      setError("Plan name, ROI, and duration are required.");
      return;
    }
    if (Number(form.minAmount || 0) < 0 || Number(form.maxAmount || 0) < 0) {
      setError("Min and max amount must be positive.");
      return;
    }
    if (Number(form.maxAmount || 0) > 0 && Number(form.maxAmount || 0) < Number(form.minAmount || 0)) {
      setError("Max amount must be greater than min amount.");
      return;
    }

    const payload = {
      name: form.name,
      roi: Number(form.roi),
      durationDays: Number(form.durationDays),
      minAmount: Number(form.minAmount || 0),
      maxAmount: Number(form.maxAmount || 0),
      details: (form.details || [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 6),
    };

    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/admin/investment-plans/${editId}`, payload);
      } else {
        await api.post("/admin/investment-plans", payload);
      }
      setShowModal(false);
      resetForm();
      await loadPlans();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.delete(`/admin/investment-plans/${id}`);
      await loadPlans();
      setMenuId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete plan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Investments</h2>
          <p className="text-sm text-slate-400">Manage investment plans and review user investments.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
        >
          <Plus className="h-4 w-4" />
          Add Investment
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Investment Plans</h3>
        {loadingPlans ? (
          <p className="mt-3 text-sm text-slate-400">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No plans created yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-200"
              >
                <div>
                  <p className="font-semibold text-white">{plan.name}</p>
                  <p className="text-xs text-slate-500">
                    ROI {plan.roi}% | {plan.durationDays} days | Min ${Number(plan.minAmount || 0).toLocaleString()} | Max {Number(plan.maxAmount || 0) > 0 ? `$${Number(plan.maxAmount).toLocaleString()}` : "No limit"}
                  </p>
                  {Array.isArray(plan.details) && plan.details.length > 0 && (
                    <p className="mt-1 text-xs text-slate-400">{plan.details.slice(0, 6).join(" | ")}</p>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuId((prev) => (prev === plan._id ? null : plan._id))}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
                    aria-label="Plan actions"
                  >
                    ...
                  </button>
                  {menuId === plan._id && (
                    <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-white/10 bg-[#0b0c0d] p-2 text-xs">
                      <button
                        onClick={() => openEdit(plan)}
                        className="w-full rounded-lg px-3 py-2 text-left text-slate-200 hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-200 hover:bg-white/5"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Pagination
            total={plansTotal}
            page={plansPage}
            setPage={setPlansPage}
            limit={plansLimit}
            setLimit={setPlansLimit}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">User Investments</h3>
        {loadingInvestments ? (
          <p className="mt-3 text-sm text-slate-400">Loading investments...</p>
        ) : investments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No user investments yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {investments.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-slate-200"
              >
                <div>
                  <p className="font-semibold text-white">{inv.planId?.name || inv.planName} | ${inv.amount}</p>
                  <p className="text-xs text-slate-500">
                    {inv.userId?.name || inv.userId?.email || "Unknown"} | ROI {inv.roi}% | {inv.durationDays} days
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{inv.status}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Pagination
            total={investmentsTotal}
            page={investmentsPage}
            setPage={setInvestmentsPage}
            limit={investmentsLimit}
            setLimit={setInvestmentsLimit}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0c0d] p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editId ? "Edit Investment Plan" : "Add Investment Plan"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-white/10 p-2 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Plan name"
                className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
              />
              <input
                value={form.roi}
                onChange={handleChange("roi")}
                placeholder="ROI %"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
              />
              <input
                value={form.durationDays}
                onChange={handleChange("durationDays")}
                placeholder="Duration days"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={form.minAmount}
                  onChange={handleChange("minAmount")}
                  placeholder="Min amount"
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
                />
                <input
                  value={form.maxAmount}
                  onChange={handleChange("maxAmount")}
                  placeholder="Max amount (0 = no limit)"
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Plan Details (up to 6)</p>
                <div className="grid gap-3">
                  {form.details.map((item, idx) => (
                    <input
                      key={`detail-${idx + 1}`}
                      value={item}
                      onChange={(event) =>
                        setForm((prev) => {
                          const next = [...prev.details];
                          next[idx] = event.target.value;
                          return { ...prev, details: next };
                        })
                      }
                      placeholder={`Detail ${idx + 1}`}
                      className="w-full rounded-xl border border-white/10 bg-[#101214] px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editId ? "Update Plan" : "Create Plan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
