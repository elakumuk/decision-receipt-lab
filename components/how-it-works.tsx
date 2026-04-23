"use client";

import { motion } from "framer-motion";
import { Fingerprint, Scale, Stamp } from "lucide-react";

const steps = [
  {
    icon: Fingerprint,
    title: "Propose the action",
    body: "Describe what the agent wants to do in plain English, including the claimed goal and any known permission basis.",
  },
  {
    icon: Scale,
    title: "Audit across 6 rules",
    body: "Ovrule scores the action against safety, authorization, causal validity, reversibility, impact scope, and consent.",
  },
  {
    icon: Stamp,
    title: "Receipt, challenge, override",
    body: "Every outcome becomes a verifiable case file with a hash, trace, challenge history, and reviewer actions.",
  },
] as const;

export function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
            Three moves from action to audit trail.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.36, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <Icon className="h-5 w-5 text-neutral-200" />
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                    0{index + 1}
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-400">{step.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
