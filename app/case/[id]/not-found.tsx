import Link from "next/link";
import { StickyHeader } from "@/components/sticky-header";

export default function CaseNotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Case not found</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-neutral-50">
              This case file does not exist.
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              The shared receipt may have been removed, or the ID was never issued by Ovrule.
            </p>
            <Link
              href="/#tool"
              className="mt-8 inline-flex rounded-full border border-white/10 bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white"
            >
              Open Ovrule
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
