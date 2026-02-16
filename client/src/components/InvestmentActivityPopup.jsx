import React from "react";

const firstNames = [
  "alex",
  "emma",
  "mike",
  "sarah",
  "daniel",
  "chris",
  "james",
  "olivia",
  "noah",
  "ava",
  "liam",
  "mia",
];

const domains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "proton.me",
];

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

const randomEmail = () => {
  const name = randomItem(firstNames);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${name}${suffix}@${randomItem(domains)}`;
};

const maskEmailUsername = (email) => {
  const [, domain = "mail.com"] = String(email).split("@");
  return `*********@${domain}`;
};

const dayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date
      - start
      + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const createSeededRandom = (seedInput) => {
  let seed = Number(seedInput) || 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const buildDailyAmountPool = () => {
  const today = new Date();
  const seedBase = today.getFullYear() * 1000 + dayOfYear(today);
  const rand = createSeededRandom(seedBase);
  const poolSize = 36;
  const amounts = [];

  for (let i = 0; i < poolSize; i += 1) {
    const base = 300 + rand() * 29500;
    const stepped = Math.round(base / 25) * 25;
    amounts.push(Math.max(200, stepped));
  }

  return amounts;
};

const formatAmount = (value) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function InvestmentActivityPopup() {
  const [visible, setVisible] = React.useState(true);
  const [activity, setActivity] = React.useState(() => {
    const email = randomEmail();
    return {
      user: maskEmailUsername(email),
      amount: formatAmount(300 + Math.random() * 29500),
    };
  });
  const amountPoolRef = React.useRef(buildDailyAmountPool());
  const recentAmountsRef = React.useRef([]);
  const hideTimerRef = React.useRef(null);

  React.useEffect(() => {
    const nextAmount = () => {
      const pool = amountPoolRef.current;
      const recent = recentAmountsRef.current;
      const avoidRecentChance = 0.85;
      let picked = null;
      let attempts = 0;

      while (attempts < 12) {
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        const repeatedRecently = recent.includes(candidate);
        const shouldAvoidRepeat = Math.random() < avoidRecentChance;
        if (!repeatedRecently || !shouldAvoidRepeat) {
          picked = candidate;
          break;
        }
        attempts += 1;
      }

      if (picked === null) {
        picked = pool[Math.floor(Math.random() * pool.length)];
      }

      recent.push(picked);
      if (recent.length > 6) {
        recent.shift();
      }

      return formatAmount(picked);
    };

    const showNewActivity = () => {
      const email = randomEmail();
      setActivity({
        user: maskEmailUsername(email),
        amount: nextAmount(),
      });
      setVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => setVisible(false), 6000);
    };

    showNewActivity();
    const interval = setInterval(() => {
      showNewActivity();
    }, 10000);

    return () => {
      clearInterval(interval);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fixed bottom-12 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm transform rounded-xl border border-amber-400/30 bg-[#111317] px-4 py-3 text-sm text-amber-100 shadow-2xl transition-all duration-500 sm:bottom-14 sm:right-6 ${
        visible
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-8 opacity-0"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
        Live Activity
      </p>
      <p className="mt-1">
        User: <span className="font-semibold">{activity.user}</span>, Invested:{" "}
        <span className="font-semibold">${activity.amount}</span>
      </p>
    </div>
  );
}
