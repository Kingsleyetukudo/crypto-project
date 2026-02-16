import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  ChartCandlestick,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Menu,
  ShieldCheck,
  Wallet,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import Logo from "../assets/new-logo-used.png";
import heroBackground from "../assets/hero-image-2.png";
import web3Network from "../assets/web3-network.svg";
import web3Certificate from "../assets/web3-certificate.svg";
import tradingCandlesDashboard from "../assets/trading-candles-dashboard.svg";
import ceoPortrait from "../assets/ceo-image.jpeg";
import ceoSignature from "../assets/ceo-signature.png";
import certificateRisk from "../assets/certificate-risk.svg";
import certificateSecurity from "../assets/certificate-security.svg";
import certificateGovernance from "../assets/certificate-governance.svg";
import teamDaniel from "../assets/team-1.jpg";
import teamSophia from "../assets/team-2.jpg";
import teamMichael from "../assets/team-3.jpg";
import api from "../api/axios.js";
import MarketTickerBar from "../components/MarketTickerBar.jsx";
import InvestmentActivityPopup from "../components/InvestmentActivityPopup.jsx";
import FloatingChatWidget from "../components/FloatingChatWidget.jsx";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#why", label: "Why Goldchain" },
  { href: "#plans", label: "Plans" },
  { href: "#news", label: "News" },
  // { href: "#certificates", label: "Certificates" },
  // { href: "#live", label: "Live Screens" },
  // { href: "#team", label: "Team" },
  // { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
  { href: "#faq", label: "FAQs" },
];

const pillars = [
  {
    icon: Lock,
    title: "Security First",
    body: "Your assets and data are protected with encrypted systems, strict account integrity rules, and security-focused controls.",
  },
  {
    icon: ChartCandlestick,
    title: "Smart Trading Infrastructure",
    body: "Goldchain uses real-time market analysis, optimized execution, and adaptive automated trading strategies.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent and Fair",
    body: "Clear rules, one-account-per-user policy, and wallet verification protect fairness, accountability, and platform stability.",
  },
  {
    icon: Wallet,
    title: "Fast and Reliable Transactions",
    body: "Deposits and withdrawals are processed efficiently through verified wallet addresses without compromising security.",
  },
  {
    icon: BadgeCheck,
    title: "Regulated Workflows",
    body: "Operational checks and policy-driven actions keep activity aligned with compliance expectations.",
  },
  {
    icon: CheckCircle2,
    title: "Performance Visibility",
    body: "Clear dashboards and reporting help users track outcomes with confidence and clarity.",
  },
  {
    icon: ShieldCheck,
    title: "Risk-Aware Controls",
    body: "Position sizing and execution rules are designed to reduce avoidable exposure.",
  },
  {
    icon: Wallet,
    title: "Verified Wallets",
    body: "Wallet verification helps prevent errors and protects user funds end to end.",
  },
  {
    icon: Lock,
    title: "Always-On Monitoring",
    body: "Continuous oversight keeps platform stability and account security top priority.",
  },
];

const certificates = [
  {
    title: "Risk Control Certification",
    subtitle: "Verified Internal Trading Framework",
    year: "2026",
    image: certificateRisk,
  },
  {
    title: "Security Operations Standard",
    subtitle: "Encrypted Infrastructure Compliance",
    year: "2026",
    image: certificateSecurity,
  },
  {
    title: "Trading Governance Certificate",
    subtitle: "Execution and Process Integrity",
    year: "2025",
    image: certificateGovernance,
  },
];

const teamMembers = [
  {
    name: "Daniel Brooks",
    role: "Head of Trading",
    bio: "Leads execution strategy and market structure across major digital assets.",
    image: teamDaniel,
  },
  {
    name: "Sophia Reed",
    role: "Risk and Compliance Lead",
    bio: "Oversees account integrity, wallet verification, and operational controls.",
    image: teamSophia,
  },
  {
    name: "Michael Grant",
    role: "Infrastructure Engineer",
    bio: "Maintains low-latency systems and secure platform reliability at scale.",
    image: teamMichael,
  },
];

const managedTradingPoints = [
  "Dedicated professional execution team monitoring market structure",
  "Disciplined risk allocation to reduce unnecessary exposure",
  "Clear performance visibility with transparent reporting",
  "Fast operational support for account and strategy questions",
  "Strict compliance flow to protect platform integrity",
];

const testimonials = [
  {
    name: "James Carter",
    role: "Active Trader",
    quote:
      "Goldchain brought structure to my trading. Execution is consistent, and the dashboards make it easy to validate each decision without second-guessing.",
  },
  {
    name: "Olivia Moore",
    role: "Long-term Investor",
    quote:
      "The process feels transparent and professional. From verification to performance tracking, everything is clear and I always know where I stand.",
  },
  {
    name: "Ethan Lewis",
    role: "Portfolio Builder",
    quote:
      "I can monitor progress without chasing updates. The reporting is clean, and the platform feels built for real investors, not hype.",
  },
  {
    name: "Ava Mitchell",
    role: "Crypto Investor",
    quote:
      "Security checks and wallet verification gave me confidence early on. I feel protected without losing speed or clarity.",
  },
  {
    name: "Noah Bennett",
    role: "Retail Trader",
    quote:
      "The UI is fast and readable, and execution is smooth. It feels reliable even during high volatility.",
  },
  {
    name: "Sophia Turner",
    role: "Growth Investor",
    quote:
      "Goldchain helps me stay disciplined with a setup that prioritizes process over noise. It keeps my focus on strategy.",
  },
  {
    name: "Liam Foster",
    role: "Digital Asset Trader",
    quote:
      "Deposits and withdrawals are dependable. That reliability matters when markets move quickly and timing is everything.",
  },
  {
    name: "Isabella Ward",
    role: "Private Investor",
    quote:
      "The one-user, one-wallet policy protects the ecosystem. It’s a simple rule that makes the platform feel more trustworthy.",
  },
  {
    name: "Mason Kelly",
    role: "Swing Trader",
    quote:
      "Risk controls are reflected in the design and policies. It feels built for long-term sustainability rather than short-term hype.",
  },
  {
    name: "Charlotte Hayes",
    role: "Professional Investor",
    quote:
      "Goldchain balances security and performance in a way few platforms do. The operational discipline is obvious.",
  },
];

const liveScreens = [
  {
    label: "BTC/USDT Strategy",
    pnl: "+$4,820",
    winRate: "72%",
    latency: "38ms",
  },
  {
    label: "ETH/USDT Momentum",
    pnl: "+$3,145",
    winRate: "68%",
    latency: "41ms",
  },
  {
    label: "SOL/USDT Trend",
    pnl: "+$2,660",
    winRate: "70%",
    latency: "35ms",
  },
];

const faqs = [
  {
    q: "Is Goldchain suitable for beginners?",
    a: "Yes. Goldchain is designed with a clean user flow that helps beginners understand deposits, verification, and trading steps without confusion while still maintaining professional controls.",
  },
  {
    q: "How secure is Goldchain?",
    a: "Goldchain applies encrypted systems, wallet verification, strict account integrity checks, and monitored operational controls to reduce unauthorized access and protect platform trust.",
  },
  {
    q: "Can I use multiple accounts or wallets?",
    a: "No. Goldchain follows a one-user, one-account, one-wallet policy to maintain fairness, accountability, and consistent compliance standards for all users.",
  },
  {
    q: "How long do withdrawals take?",
    a: "Withdrawals are processed efficiently once wallet verification and compliance checks are complete. Processing time may vary slightly depending on network conditions and account status.",
  },
  {
    q: "Is Goldchain transparent?",
    a: "Yes. Goldchain clearly defines policies, verification rules, and operational procedures so users understand how decisions are made and how account actions are handled.",
  },
  {
    q: "Do you offer managed trading?",
    a: "Yes. Goldchain provides expert-managed trading for users who prefer a hands-off approach, while still offering clear visibility into performance and account activity.",
  },
  {
    q: "What makes Goldchain different from hype platforms?",
    a: "Goldchain focuses on disciplined execution, risk-aware infrastructure, and policy-driven operations. The platform is built for long-term reliability over short-term promises.",
  },
  {
    q: "Can I monitor my performance in real time?",
    a: "Yes. Goldchain provides dashboards and strategy snapshots so users can monitor key metrics such as P&L behavior, execution flow, and portfolio direction.",
  },
  {
    q: "Are wallet addresses verified?",
    a: "Yes. Goldchain uses wallet verification to improve security and reduce operational abuse, helping ensure deposits and withdrawals are routed correctly.",
  },
  {
    q: "Is KYC required?",
    a: "Compliance requirements may apply based on account activity and platform policy. Verification steps are used to protect users and support secure operations.",
  },
  {
    q: "Can I switch from self-managed to managed trading later?",
    a: "Yes. Users can start with self-managed activity and later move to managed execution support based on their strategy preference and account profile.",
  },
  {
    q: "How often are platform systems improved?",
    a: "Goldchain continuously improves infrastructure, policy workflows, and support processes to adapt to changing market conditions and operational requirements.",
  },
  {
    q: "What if I need help quickly?",
    a: "Goldchain provides support channels for account and platform issues. Response quality and operational guidance are built to match professional service expectations.",
  },
  {
    q: "Are investment plans shown on the platform updated by admins?",
    a: "Yes. Investment plans published by authorized admins can be displayed to users with current parameters so traders can evaluate available options clearly.",
  },
  {
    q: "Does Goldchain support long-term digital asset growth?",
    a: "Yes. Goldchain is designed around strategy, discipline, and consistency with tools and operational rules that prioritize sustainable growth over impulsive decisions.",
  },
];

function InfiniteSlider({ items, renderItem, autoMs = 4500 }) {
  const [position, setPosition] = React.useState(items.length || 1);
  const [animate, setAnimate] = React.useState(true);

  const extended = React.useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items, ...items];
  }, [items]);

  const goNext = React.useCallback(() => setPosition((p) => p + 1), []);
  const goPrev = React.useCallback(() => setPosition((p) => p - 1), []);

  React.useEffect(() => {
    if (!items.length) return;
    setAnimate(false);
    setPosition(items.length);
    requestAnimationFrame(() => setAnimate(true));
  }, [items.length]);

  React.useEffect(() => {
    const timer = setInterval(goNext, autoMs);
    return () => clearInterval(timer);
  }, [goNext, autoMs]);

  const onTransitionEnd = () => {
    if (!items.length) return;
    const min = items.length - 1;
    const max = items.length * 2;
    if (position <= min) {
      setAnimate(false);
      setPosition(position + items.length);
      requestAnimationFrame(() => setAnimate(true));
    } else if (position >= max) {
      setAnimate(false);
      setPosition(position - items.length);
      requestAnimationFrame(() => setAnimate(true));
    }
  };

  const activeIndex =
    (((position - 1 + items.length) % items.length) + items.length) %
    items.length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl">
        <div
          className={`flex ${animate ? "transition-transform duration-700 ease-out" : ""}`}
          style={{ transform: `translateX(-${position * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((item, i) => (
            <div key={i} className="w-full shrink-0 px-1 sm:px-2">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 self-end sm:self-auto">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPosition(i + 1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === activeIndex ? "w-8 bg-amber-400" : "w-2.5 bg-amber-200/30"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-xl border border-white/20 p-2 text-slate-200 hover:border-white/40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl border border-white/20 p-2 text-slate-200 hover:border-white/40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState(0);
  const [planItems, setPlanItems] = React.useState([]);
  const [newsItems, setNewsItems] = React.useState([]);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);

  const getTokenPayload = (token) => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  React.useEffect(() => {
    let isMounted = true;

    const normalizeItems = (payload) => {
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload)) return payload;
      return [];
    };

    const loadSections = async () => {
      const token = localStorage.getItem("token");
      if (isMounted) {
        const payload = token ? getTokenPayload(token) : null;
        setIsLoggedIn(Boolean(payload));
        setUserRole(payload?.role || null);
      }

      try {
        const plansRes = await api.get("/investments/plans", {
          params: { page: 1, limit: 6 },
        });
        if (isMounted) setPlanItems(normalizeItems(plansRes.data));
      } catch {
        if (isMounted) setPlanItems([]);
      }

      try {
        const newsRes = await api.get("/news/crypto", {
          params: { page: 1, limit: 6 },
        });
        if (isMounted) setNewsItems(normalizeItems(newsRes.data));
      } catch {
        if (isMounted) setNewsItems([]);
      }
    };

    loadSections();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInvestClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/invest");
      return;
    }
    navigate("/login");
  };

  const dashboardPath = userRole === "admin" ? "/admin" : "/dashboard";
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050712] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[-120px] h-[360px] w-[360px] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-[6%] top-[180px] h-[360px] w-[360px] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-[340px] w-[340px] rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#060915]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <img src={Logo} alt="Site logo" className="w-30" />
          </Link>

          <nav className="hidden items-center gap-6 text-md text-slate-300 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-amber-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-md font-medium text-slate-950 hover:bg-amber-200"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-md text-slate-300 hover:text-amber-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-md text-slate-300 hover:text-amber-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-md font-medium text-slate-950 hover:bg-amber-200"
                >
                  Start Trading
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="rounded-lg border border-white/20 p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-[#060915] px-4 py-4 lg:hidden">
            <div className="space-y-3 text-sm">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-slate-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileNavOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                  >
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-amber-300 hover:text-amber-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-slate-200 hover:border-amber-300 hover:text-amber-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileNavOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                  >
                    Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pb-20">
        <section
          className="reveal-up scroll-mt-28 grid gap-8 border-white/10 p-6 backdrop-blur sm:p-8 lg:grid-cols-2 bg-cover bg-center bg-no-repeat h-[800px] "
          style={{ backgroundImage: `url(${heroBackground})` }}
          id="about"
        >
          <div className="space-y-5 flex flex-col justify-center items-start">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-amber-300">
              Where Digital Assets Meet Smart Trading
            </p>
            <h1 className="!text-5xl sm:!text-7xl font-bold leading-tight">
              Goldchain is built for disciplined crypto growth.
            </h1>
            <p className="text-md text-slate-300 sm:text-base">
              Goldchain is a next-generation crypto trading platform built for
              traders who value security, transparency, and consistent
              performance. Whether you are new to crypto or experienced,
              Goldchain gives you the structure and reliability to trade
              smarter, not harder.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-200"
              >
                Open Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/50"
              >
                Speak to Team
              </a>
              <button
                type="button"
                onClick={handleInvestClick}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-300 hover:border-amber-300/70"
              >
                Invest Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="reveal-up w-full">
          <MarketTickerBar />
        </section>

        <div className="mx-auto w-[80%] max-w-7xl">
          <section
            id="why"
            className="reveal-up scroll-mt-28 mt-25 flex flex-col items-center gap-10"
          >
            <div className="max-w-3xl flex flex-col items-center">
              <h2 className="!text-4xl font-semibold tracking-tight text-white sm:!text-7xl">
                Why Goldchain?
              </h2>
              <p className="mt-7 text-slate-300 text-center !text-md sm:!text-lg">
                We combine advanced trading technology with disciplined risk
                management to help users navigate crypto markets with
                confidence.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:border-amber-300/30"
                  >
                    <div className="mb-4 inline-flex rounded-xl bg-slate-800 p-2.5 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="plans"
            className="reveal-up scroll-mt-28 mt-25 rounded-3xl  bg-slate-900/60 p-6 sm:p-8"
          >
            <div className="flex flex-col  justify-between gap-4 sm:flex-row">
              <div className="!w-full sm:!w-[70%]">
                <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-7xl">
                  Investment Plans
                </h3>
                <p className="mt-2 text-slate-300  !text-sm mb-8 sm:!text-lg ">
                  Here is our Structured investment plans. With super
                  competitive parameters, you can choose the one that best suits
                  your trading style and goals.
                </p>
              </div>
              <div className="!w-full sm:!w-[50%] flex justify-end items-start">
                <button
                  type="button"
                  onClick={handleInvestClick}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-md font-medium text-slate-950 hover:bg-amber-200 !w-full sm:!w-auto"
                >
                  Invest
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-800/70 p-4 text-sm text-slate-300">
                You can view plans now. Login or register to invest.
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(planItems.length > 0
                ? planItems
                : Array.from({ length: 3 })
              ).map((plan, index) => (
                <article
                  key={plan?._id || `plan-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-800/70 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Plan
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-white">
                    {plan?.name || plan?.title || `Growth Plan ${index + 1}`}
                  </h4>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>Min Amount: ${plan?.minAmount ?? 100}</p>
                    <p>
                      Max Amount:{" "}
                      {Number(plan?.maxAmount ?? 10000) > 0
                        ? `$${plan?.maxAmount ?? 10000}`
                        : "No limit"}
                    </p>
                    <p>Duration: {plan?.durationDays ?? 30} days</p>
                    <p>ROI: {plan?.dailyRoi ?? plan?.roi ?? "1.8% daily"}</p>
                    {(Array.isArray(plan?.details) ? plan.details : [])
                      .slice(0, 6)
                      .map((detail, detailIndex) => (
                        <p key={`${plan?._id || index}-detail-${detailIndex}`}>
                          - {detail}
                        </p>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="news"
            className="reveal-up scroll-mt-28 mt-25 rounded-3xl  p-6 sm:p-8 flex flex-col items-center gap-6"
          >
            <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-7xl">
              Crypto News
            </h3>
            <p className="mt-2 text-slate-300 text-center !text-md sm:!text-lg ">
              Stay updated with market headlines, trend shifts, and digital
              asset ecosystem developments.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(newsItems.length > 0
                ? newsItems
                : Array.from({ length: 3 })
              ).map((item, index) => (
                <article
                  key={item?.url || `news-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-800/70 p-5"
                >
                  <p className="text-xs text-amber-300">
                    {item?.source?.name || item?.source || "Market Update"}
                  </p>
                  <h4 className="mt-2 line-clamp-2 text-base font-semibold text-white">
                    {item?.title ||
                      "Crypto market shows mixed momentum amid liquidity rotation"}
                  </h4>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                    {item?.description ||
                      "Read the latest analysis on key digital assets and macro signals influencing current market behavior."}
                  </p>
                  <div className="mt-3">
                    {item?.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-amber-300 hover:text-amber-200"
                      >
                        Read More
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Latest update
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="reveal-up mt-25 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 lg:col-span-2">
              <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
                Built for Long-Term Growth
              </h3>
              <p className="mt-2 text-slate-300 !text-sm sm:!text-md">
                At Goldchain, crypto trading is not about shortcuts. It is about
                strategy, discipline, and consistency. Our platform is designed
                to support sustainable growth by minimizing unnecessary risk
                while maximizing opportunity.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Responsible trading practices",
                  "Platform integrity",
                  "User trust and transparency",
                  "Secure, stable infrastructure",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-2xl font-semibold text-white">
                Who We Serve
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                  Crypto traders seeking a secure environment
                </li>
                <li className="flex gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                  Investors looking for structured trading systems
                </li>
                <li className="flex gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                  Users who value professionalism over hype
                </li>
                <li className="flex gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                  Individuals focused on long-term digital asset growth
                </li>
              </ul>
            </article>
          </section>

          <section className="reveal-up mt-25 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 lg:col-span-2">
              <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
                Ecosystem Metrics
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Built for performance, transparency, and scalable execution.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <p className="text-xs text-slate-400">Avg. Execution Speed</p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">
                    40ms
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <p className="text-xs text-slate-400">
                    Verified Wallet Compliance
                  </p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">
                    100%
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <p className="text-xs text-slate-400">Security Uptime</p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">
                    99.99%
                  </p>
                </div>
              </div>
            </article>
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-2">
              <img
                src={web3Network}
                alt="Goldchain ecosystem metrics visual"
                className="h-full w-full rounded-xl object-cover"
              />
            </article>
          </section>
        </div>

        <section className="reveal-up mt-25 grid gap-4 px-4 sm:px-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
              No Time to Trade? We Have You Covered.
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Goldchain offers expert-managed trading for clients who prefer a
              hands-off approach. Our professionals handle market execution
              while you track performance with transparency and confidence.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
              <BellRing className="h-4 w-4 text-amber-300" />
              Managed execution with visible performance tracking
            </div>
            <div className="mt-5 space-y-2">
              {managedTradingPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-2">
            <img
              src={tradingCandlesDashboard}
              alt="Live trading candles dashboard"
              className="h-full w-full rounded-xl object-cover"
            />
          </article>
        </section>

        <div className="mx-auto w-[90%] max-w-7xl mt-25">
          <section className="reveal-up mt-14 grid gap-4 lg:grid-cols-2 items-stretch">
            <article className="rounded-2xl bg-slate-900/60 p-12">
              <h3 className="text-5xl font-medium underline text-white decoration-amber-300  underline-offset-18">
                CEO Message
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300 mt-10">
                At Goldchain, our vision is to establish a secure, disciplined,
                and forward-thinking digital asset investment platform built on
                trust, transparency, and long-term value creation. In an
                industry often defined by volatility and speculation, we have
                chosen a different path — one rooted in structure,
                accountability, and strategic growth.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                We are not here to follow market hype or short-term momentum. We
                are here to build enduring value. Goldchain is designed for
                investors and traders who understand that sustainable success
                requires discipline, sound risk management, and reliable
                infrastructure. Every system we deploy, every control we
                implement, and every partnership we form is guided by a
                commitment to professional standards and operational integrity.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Security and governance remain at the core of our operations. We
                continuously invest in advanced technology, strengthened
                compliance frameworks, and robust internal controls to ensure
                that our platform evolves alongside the global digital asset
                landscape. As markets mature, so must the institutions that
                serve them — and we are committed to leading that evolution with
                responsibility and precision.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Our responsibility extends beyond performance. We are dedicated
                to fostering a transparent environment where clients are
                informed, supported, and empowered to make confident decisions.
                Through continuous innovation, disciplined execution, and an
                unwavering commitment to excellence, we aim to create a platform
                that stands the test of time.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Thank you for placing your trust in Goldchain. We look forward
                to building the future of digital asset investment together —
                responsibly, securely, and strategically.
              </p>
              <p className="mt-5 text-sm font-semibold text-amber-300">
                Adrian Chris Larry, CEO - Goldchain
              </p>
              <img
                src={ceoSignature}
                alt="Goldchain CEO signature"
                className=" w-25 object-cover brightness-0 invert"
              />
            </article>
            <article className="rounded-2xl h-full">
              <img
                src={ceoPortrait}
                alt="Goldchain CEO portrait"
                className="h-full w-full rounded-xl object-cover"
              />
            </article>
          </section>

          <section
            id="certificates"
            className="reveal-up scroll-mt-28 mt-25 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2"
          >
            <div className="min-w-0">
              <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
                Trading Certificates
              </h3>
              <p className="mt-3 text-slate-300">
                Showcase trust, compliance, and governance with professional
                certifications.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl bg-slate-900/60 p-2">
                <img
                  src={web3Certificate}
                  alt="Goldchain certificate visual"
                  className="w-full rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <InfiniteSlider
                items={certificates}
                autoMs={5000}
                renderItem={(item) => (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full object-cover"
                    />
                    <div className="border-t border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Certificate
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-white">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.subtitle}
                      </p>
                      <p className="mt-3 text-sm font-medium text-amber-300">
                        Issued {item.year}
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          </section>

          <section
            id="live"
            className="reveal-up scroll-mt-28 mt-25 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2"
          >
            <div className="min-w-0">
              <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
                Live Trading Screens
              </h3>
              <p className="mt-3 text-slate-300">
                Monitor active execution, win rates, latency, and performance
                behavior in real-time style cards.
              </p>
            </div>
            <div className="min-w-0">
              <InfiniteSlider
                items={liveScreens}
                autoMs={4200}
                renderItem={(item) => (
                  <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <p className="font-semibold">{item.label}</p>
                      <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
                        Live
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-center text-sm sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-400">P&L</p>
                        <p className="mt-1 font-semibold text-amber-300">
                          {item.pnl}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Win Rate</p>
                        <p className="mt-1 font-semibold">{item.winRate}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Latency</p>
                        <p className="mt-1 font-semibold">{item.latency}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-300/20" />
                  </div>
                )}
              />
            </div>
          </section>

          <section
            id="team"
            className="reveal-up scroll-mt-28 mt-25 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-5"
          >
            <div className="flex flex-col items-center justify-center">
              <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl">
                Our Professional Team
              </h3>
              <p className="mt-3 text-slate-300">
                Goldchain is built by experienced professionals focused on
                strategy, security, and reliable execution.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {teamMembers.map((member) => (
                <article
                  key={member.name}
                  className="rounded-2xl border border-white/10 bg-slate-800/70 p-5"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="mb-4 h-28 w-28 rounded-2xl border border-white/10 object-cover"
                  />
                  <h4 className="font-semibold text-white">{member.name}</h4>
                  <p className="mt-1 text-sm text-amber-300">{member.role}</p>
                  <p className="mt-2 text-sm text-slate-300">{member.bio}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="testimonials"
            className="reveal-up scroll-mt-28 mt-25 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2"
          >
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold text-white sm:text-4xl lg:text-5xl">
                What Our Traders and Investors Say
              </h3>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Real feedback from users who value structure, security, and
                disciplined trading operations.
              </p>
            </div>
            <div className="min-w-0 w-full">
              <InfiniteSlider
                items={testimonials}
                autoMs={3800}
                renderItem={(item) => (
                  <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
                    <div className="absolute right-4 top-4 text-4xl font-semibold text-white/10">
                      “
                    </div>
                    <p className="text-sm leading-6 text-slate-200 sm:leading-7">
                      {item.quote}
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-amber-300">{item.role}</p>
                      </div>
                      <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                        Verified
                      </span>
                    </div>
                  </article>
                )}
              />
            </div>
          </section>

          <section
            id="contact"
            className="reveal-up scroll-mt-28 mt-14 rounded-3xl  bg-slate-900/60 p-6 sm:p-8"
          >
            <h3 className="!text-4xl font-semibold tracking-tight text-white sm:!text-6xl underline decoration-amber-300 underline-offset-18 ">
              Contact Us
            </h3>
            <p className="mt-8 text-slate-300">
              Reach out for support, account guidance, or managed trading
              inquiries.
            </p>
            <div className="mt-9 grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/70 px-3 py-3 text-sm text-slate-200">
                  <Mail className="h-4 w-4 text-amber-300" />
                  <a
                    href="mailto:goldchainchain121@gmail.com"
                    className="hover:text-amber-300"
                  >
                    goldchainchain121@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/70 px-3 py-3 text-sm text-slate-200">
                  <Phone className="h-4 w-4 text-amber-300" />
                  +1 (213) 421-1506
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/70 px-3 py-3 text-sm text-slate-200">
                  <MapPin className="h-4 w-4 text-amber-300" />
                  Austin, Texas, United States
                </div>
              </div>

              <form className="space-y-8">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <textarea
                  rows={8}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-white/15 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-md font-medium text-slate-950 hover:bg-amber-200"
                >
                  Send Message
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>

          <section
            id="faq"
            className="reveal-up scroll-mt-28 mt-25 rounded-3xl  bg-slate-900/60 p-6 sm:p-8"
          >
            <h3 className="!text-4xl font-semibold tracking-tight text-white text-center mb-15 sm:!text-6xl underline decoration-amber-300 underline-offset-18">
              Frequently Asked Questions
            </h3>
            <div className="mt-6 space-y-3">
              {faqs.map((item, index) => (
                <article
                  key={item.q}
                  className="rounded-xl border border-white/10 bg-slate-800/70"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === index ? -1 : index))
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  >
                    <h4 className="font-semibold text-white">{item.q}</h4>
                    <span className="text-lg text-amber-300">
                      {openFaqIndex === index ? "-" : "+"}
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <div className="border-t border-white/10 px-4 py-3">
                      <p className="text-sm text-slate-300">{item.a}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#060915]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img src={Logo} alt="Goldchain logo" className="w-35" />
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Goldchain is a disciplined crypto trading platform focused on
                security, transparency, and long-term growth.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">About</p>
              <p className="mt-3 text-sm text-slate-400">
                Built for serious traders and investors with clear policies,
                real-time market insight, and reliable execution.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Quick Links</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-400">
                <a href="#about" className="hover:text-white">
                  About
                </a>
                <a href="#plans" className="hover:text-white">
                  Plans
                </a>
                <a href="#news" className="hover:text-white">
                  News
                </a>
                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500">
            <p>Goldchainfx.xyz</p>
            <p>
              (c) {new Date().getFullYear()} Goldchain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <InvestmentActivityPopup />
      <FloatingChatWidget />
    </div>
  );
}
