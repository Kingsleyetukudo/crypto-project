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
} from "lucide-react";
import api from "../api/axios.js";
import profileAvatar from "../assets/profile-avatar.png";
import FloatingChatWidget from "../components/FloatingChatWidget.jsx";

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

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileName, setProfileName] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");

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

  const walletLabel = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "No wallet address";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0c0d] text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#101214] via-[#0b0c0d] to-[#0b0c0d] px-6 py-8 lg:flex">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-semibold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400/15">
              <span className="h-4 w-4 rounded-full border-2 border-emerald-300" />
            </span>
            Cryptos
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
                        ? "bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(52,211,153,0.4)]"
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

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-white/10 bg-[#0b0c0d]/90 px-6 py-4 backdrop-blur">
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            <div className="flex flex-1 items-center justify-end gap-6">
              <div className="hidden w-full max-w-md items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:flex">
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
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>

          <footer className="border-t border-white/10 px-6 py-4 text-xs text-slate-600">
            (c) {new Date().getFullYear()} Cryptos. All rights reserved.
          </footer>
        </div>
      </div>

      <FloatingChatWidget />
    </div>
  );
}
