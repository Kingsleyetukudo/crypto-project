import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f2f5f8] text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Goldchain
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Contact Us</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Let us discuss your trading goals.</h1>
            <p className="mt-3 text-sm text-slate-300">
              Reach out to Goldchain support for platform questions, account guidance, and managed trading inquiries.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Mail className="h-4 w-4 text-emerald-300" />
                support@goldchain.com
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                +1 (305) 982-1024
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                Miami, Florida, United States
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Send a message</h2>
            <p className="mt-2 text-sm text-slate-600">
              We typically respond within one business day.
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Message</label>
                <textarea
                  rows={5}
                  placeholder="Write your message"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-600"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Send Message
              </button>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}
