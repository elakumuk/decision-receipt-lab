"use client";

import { motion } from "framer-motion";

const paragraphs = [
  "AI agents already change prices, send messages, move money, and refuse requests. Most of those decisions happen without a durable record of what the agent believed, what authority it had, or what risk it created.",
  "Ovrule turns each proposed action into a case file. Instead of a bare output, you get a verdict, a rule trace, evidence used, missing information, a receipt hash, and a timeline for contests and reviewer overrides.",
  "It is built for teams shipping agent workflows in support, operations, growth, finance, and governance, where explaining why an action was blocked matters as much as the block itself.",
] as const;

export function AboutSection() {
  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">About</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
              Accountability should be native to agent systems, not an afterthought.
            </h2>
          </div>

          <div className="space-y-6 text-sm leading-8 text-neutral-400 sm:text-base">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
