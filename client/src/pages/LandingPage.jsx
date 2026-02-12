import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Menu,
  MoveRight,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import FloatingChatWidget from "../components/FloatingChatWidget.jsx";
import api from "../api/axios.js";
import heroDashboard from "../assets/hero-dashboard.svg";

const coins = ["BTC", "ETH", "XRP", "SOL", "ADA", "DOT", "BNB", "LTC"];

const testimonials = [
  {
    quote:
      "Minecore has completely changed the way I manage my crypto assets. The tools are intuitive and effective.",
    name: "Bryan Buckler",
    role: "Crypto Enthusiast",
  },
  {
    quote:
      "Clean interface, clear analytics, and better discipline in how I allocate my portfolio every week.",
    name: "Mia Sanders",
    role: "Asset Manager",
  },
  {
    quote:
      "I moved from spreadsheets to this platform. Tracking has never been this simple or this fast.",
    name: "Mason Jordan",
    role: "Product Designer",
  },
];

export default function LandingPage() {
  const [tickerItems, setTickerItems] = React.useState([]);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadTicker = async () => {
      try {
        const res = await api.get("/market/ticker", {
          params: { symbols: "BTC,ETH,SOL,XRP,ADA,DOGE" },
        });
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        if (!isMounted) return;
        setTickerItems(items);
      } catch {
        if (!isMounted) return;
        setTickerItems([]);
      }
    };

    loadTicker();
    const intervalId = setInterval(loadTicker, 45000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const bySymbol = React.useMemo(() => {
    return tickerItems.reduce((acc, item) => {
      if (item?.symbol) acc[item.symbol] = item;
      return acc;
    }, {});
  }, [tickerItems]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(Number(value) || 0);

  const btc = Number(bySymbol.BTC?.lastPrice || 43861);
  const eth = Number(bySymbol.ETH?.lastPrice || 2305);
  const sol = Number(bySymbol.SOL?.lastPrice || 102);
  const xrp = Number(bySymbol.XRP?.lastPrice || 0.6);

  const totalAssets = btc * 0.45 + eth * 2.8 + sol * 24 + xrp * 1800;
  const avgChange =
    tickerItems.length > 0
      ? tickerItems.reduce((sum, item) => sum + (Number(item.changePercent) || 0), 0) /
        tickerItems.length
      : 2.4;
  const todayProfit = totalAssets * (avgChange / 100);
  const marketSignal = avgChange >= 0 ? "Bullish Trend" : "Cautious Trend";
  const riskScore = Math.max(8, Math.min(46, Math.round(28 - avgChange * 3)));

  const tableRows =
    tickerItems.length > 0
      ? tickerItems.slice(0, 3).map((item) => ({
          symbol: item.symbol,
          price: Number(item.lastPrice) || 0,
          volume: Number(item.volume24h) || 0,
          change: Number(item.changePercent) || 0,
        }))
      : [
          { symbol: "BTC", price: 43861, volume: 6.73, change: 3.2 },
          { symbol: "ETH", price: 2305, volume: 3.41, change: -1.4 },
          { symbol: "SOL", price: 102, volume: 1.07, change: 4.7 },
        ];

  return (
    <div className="min-h-screen bg-[#060818] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[30%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/95 font-['Poppins'] backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-100">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            Minecore
          </Link>

          <nav className="hidden items-center gap-7 text-xs text-slate-300 lg:flex">
            <a href="#about" className="hover:text-white">About us</a>
            <a href="#features" className="hover:text-white">How it works</a>
            <a href="#coins" className="hover:text-white">Smart solutions</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact us</a>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              to="/login"
              className="text-xs text-slate-200 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.02] px-4 py-2 text-xs text-slate-100 hover:border-white/40"
            >
              Get started now
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/[0.02] text-slate-200 transition hover:border-white/30 hover:text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <div
          className={`absolute left-0 right-0 top-full z-40 mx-auto max-w-[1200px] px-4 transition-all duration-300 ease-out md:px-6 lg:hidden ${
            mobileNavOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a0d18] p-4 shadow-2xl">
            <nav className="space-y-3 text-sm text-slate-200">
              <a href="#about" onClick={() => setMobileNavOpen(false)} className="block hover:text-white">About us</a>
              <a href="#features" onClick={() => setMobileNavOpen(false)} className="block hover:text-white">How it works</a>
              <a href="#coins" onClick={() => setMobileNavOpen(false)} className="block hover:text-white">Smart solutions</a>
              <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="block hover:text-white">Pricing</a>
              <a href="#contact" onClick={() => setMobileNavOpen(false)} className="block hover:text-white">Contact us</a>
            </nav>
            <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="text-sm text-slate-200 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.02] px-4 py-2 text-sm text-slate-100 hover:border-white/40"
              >
                Get started now
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-14">
        <section className="text-center">
          <p className="mx-auto inline-flex items-center rounded-full border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-200">
            Smart Crypto Experience
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Invest Crypto Smarter
            <br />
            With AI Assistant
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-slate-300 sm:text-base">
            Explore market opportunities and grow your portfolio with cleaner insights, live tracking, and high-signal automation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm text-slate-100 transition hover:border-white/40"
            >
              <Play className="h-3.5 w-3.5" />
              Watch Demo
            </button>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#0b1125] via-[#090d1e] to-[#070a16] px-4 py-4 shadow-[0_30px_120px_rgba(113,63,255,0.28)] md:px-6 md:py-6">
            <div className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
            <img
              src={heroDashboard}
              alt="Modern crypto investment dashboard preview"
              className="relative z-10 h-auto w-full rounded-[1.45rem] border border-white/10 object-cover"
            />

            <div className="relative z-20 mt-4 grid gap-3 text-left sm:grid-cols-3">
              <article className="rounded-xl border border-white/10 bg-[#0b1022]/85 p-4 backdrop-blur">
                <p className="text-xs text-slate-400">Total Assets</p>
                <p className="mt-2 text-lg font-semibold">{formatMoney(totalAssets)}</p>
                <p className="mt-1 text-xs text-emerald-300">
                  {avgChange >= 0 ? "+" : ""}
                  {avgChange.toFixed(2)}% today
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-[#0b1022]/85 p-4 backdrop-blur">
                <p className="text-xs text-slate-400">Portfolio Tracker</p>
                <p className="mt-2 text-lg font-semibold">
                  {todayProfit >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(todayProfit))}
                </p>
                <p className="mt-1 text-xs text-slate-400">{marketSignal}</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-[#0b1022]/85 p-4 backdrop-blur">
                <p className="text-xs text-slate-400">Risk Score</p>
                <p className="mt-2 text-lg font-semibold">{riskScore}/100</p>
                <p className="mt-1 text-xs text-slate-400">AI-driven profile</p>
              </article>
            </div>
          </div>
        </section>

        <section id="coins" className="mt-20">
          <h2 className="text-center text-2xl font-semibold">Our Crypto Coin</h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Unlock a better crypto workflow with reliable investment tools.
          </p>
          <div className="mt-8 grid grid-cols-2 border border-white/10 sm:grid-cols-4">
            {coins.map((coin) => (
              <div
                key={coin}
                className="grid h-20 place-items-center border border-white/10 bg-white/[0.02] text-slate-300"
              >
                {coin}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h3 className="text-3xl font-semibold leading-tight">
              Modern Digital
              <br />
              Investment
            </h3>
            <p className="mt-4 max-w-md text-sm text-slate-300">
              Advanced analytics, live allocation data, and strategy automation with clear portfolio feedback.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Collaborative Analysis</p>
              <p className="mt-2 text-xs text-slate-400">Decision-ready market insights</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Updated 24/7</p>
              <p className="mt-2 text-xs text-slate-400">Fresh portfolio and signal feed</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Strategic Investment</p>
              <p className="mt-2 text-xs text-slate-400">Risk-aware asset direction</p>
            </article>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-4xl font-semibold leading-tight">
            Next-Gen Crypto
            <br />
            Investment Platform
          </h2>
          <p className="mt-3 text-center text-sm text-slate-400">
            Powerful dashboard experience built for modern investors.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-b from-[#101532] to-[#090d22] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Earning Report</p>
                <p className="mt-3 text-3xl font-semibold">
                  +{formatMoney(totalAssets * 0.08)}
                </p>
                <p className="mt-1 text-xs text-emerald-300">Growing</p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20" />
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Performance Tracker</p>
                <p className="mt-3 text-3xl font-semibold">
                  {todayProfit >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(todayProfit))}
                </p>
                <p className="mt-1 text-xs text-emerald-300">
                  {avgChange >= 0 ? "+" : ""}
                  {avgChange.toFixed(2)}%
                </p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20" />
              </article>
            </div>

            <article className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold">Market Performance</h4>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200"
                >
                  Download Report
                  <MoveRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-slate-400">
                    <tr className="border-b border-white/10">
                      <th className="py-2">Coin</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Volume</th>
                      <th className="py-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, index) => (
                      <tr
                        key={row.symbol}
                        className={index < tableRows.length - 1 ? "border-b border-white/10" : ""}
                      >
                        <td className="py-3">{row.symbol}</td>
                        <td>{formatMoney(row.price)}</td>
                        <td>{(row.volume / 1000000).toFixed(2)}M</td>
                        <td className={row.change >= 0 ? "text-emerald-300" : "text-rose-300"}>
                          {row.change >= 0 ? "+" : ""}
                          {row.change.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d1230] to-[#11112b] p-8">
          <h3 className="text-center text-3xl font-semibold">Set Asset Direction</h3>
          <p className="mt-3 text-center text-sm text-slate-300">
            Take control of your investments by using data-driven tools in your account.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-slate-400">Total Assets</p>
              <p className="mt-2 text-4xl font-semibold">{formatMoney(totalAssets)}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 w-[69%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
              </div>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-slate-400">Allocation Insights</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Bitcoin</span>
                  <span>{formatMoney(btc)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ethereum</span>
                  <span>{formatMoney(eth)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Solana</span>
                  <span>{formatMoney(sol)}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="pricing" className="mt-24 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h3 className="text-3xl font-semibold leading-tight">
              Get Minecore
              <br />
              Account For <span className="text-emerald-300">$100</span> Balance Wallet
            </h3>
            <p className="mt-4 text-sm text-slate-300">
              Begin your portfolio journey with a starter balance account and scale your strategy over time.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Get The Minecore Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#101532] to-[#0c1028] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Daily Return</p>
                <p className="mt-2 text-xl font-semibold">1.2% - 2.3%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Support</p>
                <p className="mt-2 text-xl font-semibold">24/7 Live</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">KYC</p>
                <p className="mt-2 text-xl font-semibold">Required</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Risk Profile</p>
                <p className="mt-2 text-xl font-semibold">Balanced</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <h3 className="text-center text-4xl font-semibold">What They've Said About Us</h3>
          <p className="mt-3 text-center text-sm text-slate-400">
            See what our users are saying about Minecore.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">"{item.quote}"</p>
                <div className="mt-6">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0e1431] to-[#0a1025] p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">Boost Your Crypto Asset With Our Apps</h3>
              <p className="mt-3 text-sm text-slate-300">
                Start with a secure account and expand your strategy with confidence.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-white/10 px-6 py-10 text-sm text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-white">Minecore</p>
            <p className="mt-3 text-sm text-slate-500">
              Invest smarter with real-time portfolio tracking and modern crypto tools.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Platform</p>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>Features</li>
              <li>Security</li>
              <li>Market</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Resources</p>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>Help Center</li>
              <li>Documentation</li>
              <li>Terms</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>support@minecore.app</li>
              <li>+1 (305) 982-1024</li>
              <li>Miami, FL</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-500">
          (c) {new Date().getFullYear()} All rights reserved.
        </div>
      </footer>

      <FloatingChatWidget />
    </div>
  );
}
