import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BarChart3,
  CreditCard,
  Home,
  LifeBuoy,
  MessageSquare,
  Settings,
  ShoppingBag,
  Users,
  Search,
  Activity,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import api from "../api/axios.js";
import profileAvatar from "../assets/profile-avatar.png";
import Logo from "../assets/new-logo-used.png";
import FloatingChatWidget from "../components/FloatingChatWidget.jsx";
import InvestmentActivityPopup from "../components/InvestmentActivityPopup.jsx";

const normalizeWallets = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (data && data._id) return [data];
  return [];
};

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/deposit", label: "Deposit", icon: CreditCard },
  { to: "/invest", label: "Investment", icon: BarChart3 },
  { to: "/my-investments", label: "My Investments", icon: BarChart3 },
  { to: "/withdraw", label: "Withdraw", icon: ShoppingBag },
  { to: "/kyc", label: "KYC Approval", icon: Users },
  { to: "/history", label: "History", icon: CreditCard },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/trades", label: "Trades", icon: Activity },
  { to: "/news", label: "Crypto News", icon: MessageSquare },
];

const bottomItems = [
  { to: "/help", label: "Help Center", icon: LifeBuoy },
  { to: "/settings", label: "Settings", icon: Settings },
];

const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileName, setProfileName] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const pageTitle = React.useMemo(() => {
    const active = navItems.find((item) => item.to === location.pathname);
    if (active) return active.label;
    if (location.pathname === "/help") return "Help Center";
    if (location.pathname === "/settings") return "Settings";
    return "Overview";
  }, [location.pathname]);

  React.useEffect(() => {
    let isMounted = true;

    const loadHeaderData = async () => {
      try {
        const [profileRes, walletRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/wallets", { params: { page: 1, limit: 1 } }),
        ]);

        if (!isMounted) return;

        const name = profileRes.data?.name || "";
        const wallet = normalizeWallets(walletRes.data)[0] || null;

        setProfileName(name);
        setWalletAddress(wallet?.address || "");
      } catch {
        if (!isMounted) return;
        setProfileName("");
        setWalletAddress("");
      }
    };

    loadHeaderData();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const walletLabel = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "No wallet address";

  const handleLogout = React.useCallback((reason = "manual") => {
    localStorage.removeItem("token");
    navigate(reason === "idle" ? "/login?expired=1" : "/login");
  }, [navigate]);

  React.useEffect(() => {
    let timeoutId;
    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout("idle");
      }, IDLE_TIMEOUT_MS);
    };

    resetTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [handleLogout]);

  return (
    <div className="h-screen overflow-hidden bg-[#0b0c0d] text-white">
      <div className="flex h-screen">
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#101214] via-[#0b0c0d] to-[#0b0c0d] px-6 py-8">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center"
                >
                  <img
                    src={Logo}
                    alt="Goldchain logo"
                    className="h-12 w-auto max-w-[160px] object-contain"
                  />
                </Link>
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="sidebar-scrollbar mt-10 flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                          isActive
                            ? "bg-amber-400 text-slate-950 shadow-[0_0_0_1px_rgba(52,211,153,0.4)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#101214] via-[#0b0c0d] to-[#0b0c0d] px-6 py-8 lg:flex">
        <Link
          to="/"
          className="inline-flex items-center"
        >
          <img
            src={Logo}
            alt="Goldchain logo"
            className="h-12 w-auto max-w-[160px] object-contain"
          />
        </Link>
          <nav className="sidebar-scrollbar mt-10 flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-[0_0_0_1px_rgba(52,211,153,0.4)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0c0d]/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="space-y-3 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label="Open sidebar"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <img
                    src={profileAvatar}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-semibold text-white">
                      {profileName || "User"}
                    </p>
                    <p className="truncate text-slate-500">{walletLabel}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-xl font-semibold">{pageTitle}</h1>
                <button className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-400" />
                </button>
              </div>
            </div>

            <div className="hidden items-center justify-between gap-6 md:flex">
              <h1 className="text-2xl font-semibold">{pageTitle}</h1>
              <div className="flex flex-1 items-center justify-end gap-6">
                <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Search className="h-4 w-4" />
                  <input
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <button className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-400" />
                </button>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <img
                    src={profileAvatar}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">
                      {profileName || "User"}
                    </p>
                    <p className="text-slate-500">{walletLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>

          <footer className="border-t border-white/10 px-4 py-4 text-xs text-slate-600 sm:px-6">
            (c) {new Date().getFullYear()} Goldchain. All rights reserved.
          </footer>
        </div>
      </div>

      <InvestmentActivityPopup />
      <FloatingChatWidget />
    </div>
  );
}
