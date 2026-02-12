import React from "react";

const faqs = [
  {
    q: "How do I make a deposit?",
    a: "Go to Deposit, select a wallet, send funds to the shown address, then submit your transaction hash.",
  },
  {
    q: "Why is my withdrawal pending?",
    a: "Withdrawals are reviewed by admin for security checks before completion.",
  },
  {
    q: "Where can I track my profits?",
    a: "Use the Profits and History pages to view profit payouts and all transaction records.",
  },
  {
    q: "How do I secure my account?",
    a: "Use a strong password, avoid sharing your token, and complete KYC verification.",
  },
];

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Help Center</h2>
        <p className="text-sm text-slate-400">
          Quick support for common account and transaction questions.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
        <div className="mt-4 space-y-3">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/10 bg-[#101214] p-4"
            >
              <p className="text-sm font-semibold text-white">{item.q}</p>
              <p className="mt-2 text-sm text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Need More Help?</h3>
        <p className="mt-2 text-sm text-slate-400">
          Contact support at <span className="text-emerald-300">support@cryptos.com</span>
          {" "}with your account email and transaction reference for faster assistance.
        </p>
      </div>
    </div>
  );
}
