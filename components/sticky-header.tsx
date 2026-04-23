"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { OvruleWordmark } from "@/components/ovrule-wordmark";

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/ledger", label: "Ledger" },
  { href: "/docs", label: "Docs" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/demo?state=refused", label: "Demo" },
  { href: "https://github.com/elakumuk/decision-receipt-lab", label: "GitHub", external: true },
];

export function StickyHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0b]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-[18px] font-semibold tracking-[-0.03em] text-neutral-50">
            <OvruleWordmark className="h-8 w-auto text-neutral-50 sm:h-[2.15rem]" />
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-neutral-400 md:flex">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-neutral-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className="transition hover:text-neutral-100">
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-2 text-neutral-300 md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open ? (
          <nav className="mt-4 grid gap-3 border-t border-white/8 pt-4 text-sm text-neutral-300 md:hidden">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-neutral-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-neutral-100"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
