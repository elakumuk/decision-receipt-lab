import Link from "next/link";
import { StickyHeader } from "@/components/sticky-header";
import { getLedgerPage } from "@/lib/receipts";

type LedgerPageProps = {
  searchParams?: {
    page?: string;
  };
};

function verdictTone(verdict: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED") {
  if (verdict === "ADMISSIBLE") {
    return "border-emerald-400/25 bg-emerald-400/8 text-emerald-200";
  }

  if (verdict === "AMBIGUOUS") {
    return "border-amber-400/25 bg-amber-400/8 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/8 text-red-200";
}

export default async function LedgerPage({ searchParams }: LedgerPageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const ledger = await getLedgerPage(page);

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Public ledger</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
              Trust ledger
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              Every stored receipt becomes a line in the public register. The chain view shows how case hashes, timestamps, and verdicts accumulate over time.
            </p>
          </div>

          {ledger.totalCount === 0 ? (
            <div className="mt-10 rounded-[32px] border border-white/8 bg-white/[0.03] p-8 text-center">
              <p className="text-2xl font-medium tracking-[-0.03em] text-neutral-50">
                First case starts the chain →
              </p>
              <Link
                href="/#tool"
                className="mt-6 inline-flex rounded-full border border-white/10 bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white"
              >
                Open Ovrule
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-10 rounded-[34px] border border-white/8 bg-white/[0.03] p-6 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:16px_16px]">
                <div className="space-y-6">
                  {ledger.receipts.map((receipt, index) => (
                    <div key={receipt.id} className="relative pl-10">
                      {index < ledger.receipts.length - 1 ? (
                        <div className="absolute left-[11px] top-10 h-[calc(100%+18px)] w-px bg-white/10" />
                      ) : null}
                      <div className="absolute left-0 top-2 h-6 w-6 rounded-full border border-white/10 bg-white/[0.05]" />
                      <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] ${verdictTone(receipt.verdict)}`}>
                              {receipt.verdict}
                            </div>
                            <p className="mt-4 text-sm leading-7 text-neutral-300">{receipt.summary}</p>
                          </div>
                          <div className="text-right text-xs uppercase tracking-[0.18em] text-neutral-500">
                            <p>{receipt.severity}</p>
                            <p className="mt-2">{receipt.timestamp}</p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Hash</p>
                            <p className="mt-2 font-mono text-sm text-neutral-200">{receipt.hash}</p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Previous hash</p>
                            <p className="mt-2 font-mono text-sm text-neutral-200">{receipt.previousHash ?? "chain origin"}</p>
                          </div>
                        </div>

                        <Link
                          href={`/case/${receipt.id}`}
                          className="mt-5 inline-flex text-sm text-neutral-300 transition hover:text-neutral-100"
                        >
                          View case →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm text-neutral-400">
                <span>
                  Page {ledger.page} of {Math.max(1, ledger.totalPages)}
                </span>
                <div className="flex gap-3">
                  {ledger.page > 1 ? (
                    <Link href={`/ledger?page=${ledger.page - 1}`} className="transition hover:text-neutral-100">
                      Previous
                    </Link>
                  ) : (
                    <span className="text-neutral-600">Previous</span>
                  )}
                  {ledger.page < ledger.totalPages ? (
                    <Link href={`/ledger?page=${ledger.page + 1}`} className="transition hover:text-neutral-100">
                      Next
                    </Link>
                  ) : (
                    <span className="text-neutral-600">Next</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
