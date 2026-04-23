"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileCheck2, Scale, Stamp } from "lucide-react";
import { useMemo, useState } from "react";
import { demoRefusedReceipt } from "@/lib/demo-data";

function PreviewCaseCard() {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Case file preview</p>
            <p className="mt-2 text-lg font-medium text-neutral-50">Vendor payment escalation</p>
          </div>
          <div className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.26em] text-red-300">
            Refused
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-red-400/18 bg-red-400/[0.05] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
            <Scale className="h-4 w-4 text-red-300" />
            Missing verification and authorization
          </div>
          <p className="mt-3 text-sm leading-7 text-neutral-300">
            Unverified banking changes and missing approval keep this payment out of policy.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">Receipt</p>
            <p className="mt-3 font-mono text-sm text-neutral-200">{demoRefusedReceipt.hash}</p>
            <p className="mt-2 font-mono text-xs text-neutral-500">{demoRefusedReceipt.receiptId.slice(0, 18)}...</p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">Rules tripped</p>
            <div className="mt-3 space-y-2 text-sm text-neutral-300">
              <p>Safety</p>
              <p>Authorization</p>
              <p>Causal validity</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 right-4 rotate-[-14deg] rounded-full border border-red-400/30 bg-red-400/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.38em] text-red-300">
          Refused
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [expanded, setExpanded] = useState(false);
  const previewEvents = useMemo(() => demoRefusedReceipt.history.slice(0, 2), []);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Agent accountability layer</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl lg:text-6xl">
              Every agent action deserves a case file.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-400 sm:text-lg">
              Ovrule audits proposed agent actions, issues a structured verdict, and turns the result into a verifiable receipt with evidence gaps, challenge history, and human override trails.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#tool"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white"
              >
                Try a case
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-neutral-200 transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                See a case
                <ArrowRight className={`h-4 w-4 transition ${expanded ? "rotate-90" : ""}`} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <PreviewCaseCard />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-[30px] border border-white/8 bg-white/[0.03] p-5"
        >
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Seeded example case</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-red-300">
                  REFUSED
                </span>
                <p className="text-sm text-neutral-300">
                  Transfer $18,000 to a new vendor after banking details changed on an urgent invoice.
                </p>
              </div>
            </div>
            <span className="text-sm text-neutral-400">{expanded ? "Hide case" : "See a case →"}</span>
          </button>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-red-300">
                        {demoRefusedReceipt.decision}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">
                        Risk {demoRefusedReceipt.riskScore}/100
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-neutral-300">{demoRefusedReceipt.summary}</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {demoRefusedReceipt.ruleTrace.slice(0, 3).map((item) => (
                        <div key={item.rule} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                          <p className="text-sm font-medium text-neutral-100">{item.rule}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                            {item.verdict}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
                        <FileCheck2 className="h-4 w-4 text-neutral-300" />
                        Evidence missing
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                        {demoRefusedReceipt.evidenceMissing.map((item) => (
                          <li key={item.label}>{item.label}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
                        <Stamp className="h-4 w-4 text-neutral-300" />
                        Timeline preview
                      </div>
                      <div className="mt-3 space-y-3">
                        {previewEvents.map((event) => (
                          <div key={event.id} className="text-sm text-neutral-400">
                            <p className="text-neutral-200">{event.actorLabel}</p>
                            <p className="mt-1 text-xs text-neutral-500">{event.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
