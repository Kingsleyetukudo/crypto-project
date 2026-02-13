import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Activity, ClipboardCheck, Home, LogOut, Settings, Shield, Menu, X } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: Home },
  { to: "/admin/deposits", label: "Deposit Approvals", icon: ClipboardCheck },
  { to: "/admin/withdrawals", label: "Withdrawal Approvals", icon: ClipboardCheck },
  { to: "/admin/investments", label: "Investments", icon: Activity },
  { to: "/admin/kyc", label: "KYC Approval", icon: Shield },
  { to: "/admin/wallets", label: "Deposit Wallets", icon: Activity },
  { to: "/admin/history", label: "History", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950/95 p-6">
              <div className="flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold tracking-wide">
                  CryptoInvest
                </Link>
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                Admin Console
              </p>
              <nav className="mt-10 flex flex-1 flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                          isActive
                            ? "bg-rose-500/15 text-rose-200"
                            : "text-slate-300 hover:bg-slate-900/60"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
              <button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-rose-400 hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </aside>
          </div>
        )}

        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-800 bg-slate-950/80 p-6 lg:flex">
          <Link to="/" className="text-xl font-semibold tracking-wide">
            CryptoInvest
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            Admin Console
          </p>
          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-rose-500/15 text-rose-200"
                        : "text-slate-300 hover:bg-slate-900/60"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-rose-400 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">
                Review transactions, manage users, and monitor risk.
              </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-4 py-2 text-xs text-slate-300 hover:border-rose-400 hover:text-rose-200">
                <Shield className="h-3 w-3" />
                Risk Mode
              </button>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>

          <footer className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
            © {new Date().getFullYear()} CryptoInvest. Admin access required.
          </footer>
        </div>
      </div>
    </div>
  );
}
