"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { useTheme } from "@/lib/theme";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  }

  return (
    <SmoothScroll>
      <div
        className={`min-h-screen ${
          isLight ? "bg-[#f5f2eb] text-[#18181b]" : "bg-[#080808] text-neutral-100"
        } flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-200`}
      >
        <Navbar />

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[720px] mx-auto px-6 sm:px-8">
            <div className="mb-12 space-y-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs tracking-wider uppercase ${
                  isLight
                    ? "border-black/10 bg-black/5 text-neutral-700"
                    : "border-white/10 bg-white/[0.04] text-neutral-300"
                }`}
              >
                <Mail className={`h-3.5 w-3.5 ${isLight ? "text-neutral-600" : "text-neutral-400"}`} />
                <span>INQUIRIES</span>
              </div>
              <h1
                className={`text-[clamp(38px,5.2vw,58px)] font-bold sm:font-semibold leading-[1.08] tracking-tight ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Talk to the team.
              </h1>
              <p
                className={`text-[18px] sm:text-[19px] leading-relaxed font-normal ${
                  isLight ? "text-neutral-600" : "text-neutral-200"
                }`}
              >
                Questions about the project, research, collaboration or deployment? Get in touch.
              </p>
            </div>

            {submitted ? (
              <div
                className={`rounded-2xl border p-8 text-center space-y-3 ${
                  isLight
                    ? "border-black/10 bg-[#fcfbf8] shadow-sm"
                    : "border-white/15 bg-[#0e0e0e]"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                >
                  Message received
                </h2>
                <p
                  className={`text-base max-w-sm mx-auto leading-relaxed ${
                    isLight ? "text-neutral-600" : "text-neutral-200"
                  }`}
                >
                  Thank you for reaching out. We will review your inquiry and follow up shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className={`tech-card rounded-2xl p-7 sm:p-9 space-y-6 border transition-all ${
                  isLight
                    ? "!bg-[#fcfbf8] !border-black/10 shadow-sm"
                    : "border-white/10 bg-[#0c0c0c]"
                }`}
              >
                <div>
                  <label
                    htmlFor="name"
                    className={`block font-mono text-xs uppercase tracking-wider mb-2 font-medium ${
                      isLight ? "text-neutral-700" : "text-neutral-300"
                    }`}
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name or affiliation"
                    className={`w-full rounded-xl border px-4 py-3.5 text-base transition-colors focus:outline-none ${
                      isLight
                        ? "border-black/10 bg-[#f5f2eb] text-neutral-900 placeholder:text-neutral-500 focus:border-black/30"
                        : "border-white/10 bg-[#121212] text-white placeholder-neutral-500 focus:border-white/40"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className={`block font-mono text-xs uppercase tracking-wider mb-2 font-medium ${
                      isLight ? "text-neutral-700" : "text-neutral-300"
                    }`}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@organization.com"
                    className={`w-full rounded-xl border px-4 py-3.5 text-base transition-colors focus:outline-none ${
                      isLight
                        ? "border-black/10 bg-[#f5f2eb] text-neutral-900 placeholder:text-neutral-500 focus:border-black/30"
                        : "border-white/10 bg-[#121212] text-white placeholder-neutral-500 focus:border-white/40"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className={`block font-mono text-xs uppercase tracking-wider mb-2 font-medium ${
                      isLight ? "text-neutral-700" : "text-neutral-300"
                    }`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your research, remote sensing inquiry, or partnership questions..."
                    className={`w-full rounded-xl border px-4 py-3.5 text-base transition-colors resize-none focus:outline-none ${
                      isLight
                        ? "border-black/10 bg-[#f5f2eb] text-neutral-900 placeholder:text-neutral-500 focus:border-black/30"
                        : "border-white/10 bg-[#121212] text-white placeholder-neutral-500 focus:border-white/40"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all shadow-lg ${
                    isLight
                      ? "bg-[#18181b] text-white hover:bg-black shadow-black/10"
                      : "bg-white text-black hover:bg-neutral-200 hover:shadow-white/10"
                  }`}
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
