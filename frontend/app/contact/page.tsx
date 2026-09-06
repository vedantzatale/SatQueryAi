"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[720px] mx-auto px-6 sm:px-8">
            <div className="mb-12 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-xs tracking-wider uppercase text-neutral-300">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                <span>INQUIRIES</span>
              </div>
              <h1 className="text-[clamp(38px,5.2vw,58px)] font-bold sm:font-semibold leading-[1.08] tracking-tight text-white">
                Talk to the team.
              </h1>
              <p className="text-[18px] sm:text-[19px] leading-relaxed text-neutral-200 font-normal">
                Questions about the project, research, collaboration or deployment? Get in touch.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-white/15 bg-[#0e0e0e] p-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Message received</h2>
                <p className="text-base text-neutral-200 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. We will review your inquiry and follow up shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="tech-card rounded-2xl p-7 sm:p-9 space-y-6 border border-white/10 bg-[#0c0c0c]"
              >
                <div>
                  <label htmlFor="name" className="block font-mono text-xs text-neutral-300 uppercase tracking-wider mb-2 font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name or affiliation"
                    className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3.5 text-base text-white placeholder-neutral-500 focus:border-white/40 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-xs text-neutral-300 uppercase tracking-wider mb-2 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@organization.com"
                    className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3.5 text-base text-white placeholder-neutral-500 focus:border-white/40 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-xs text-neutral-300 uppercase tracking-wider mb-2 font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your research, remote sensing inquiry, or partnership questions..."
                    className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3.5 text-base text-white placeholder-neutral-500 focus:border-white/40 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-black hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/10"
                >
                  <span>Send message</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
