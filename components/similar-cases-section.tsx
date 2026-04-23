import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SimilarCase } from "@/lib/schemas";

function verdictTone(decision: SimilarCase["decision"]) {
  if (decision === "ADMISSIBLE") {
    return "border-emerald-400/25 bg-emerald-400/8 text-emerald-200";
  }

  if (decision === "AMBIGUOUS") {
    return "border-amber-400/25 bg-amber-400/8 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/8 text-red-200";
}

export function SimilarCasesSection({
  similarCases,
  isLoading = false,
}: {
  similarCases: SimilarCase[];
  isLoading?: boolean;
}) {
  return (
    <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
            Similar past cases
          </p>
          <p className="mt-2 text-sm leading-7 text-neutral-400">
            Related decisions surfaced from the recent receipt register.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`similar-loading-${index}`}
              className="rounded-[22px] border border-white/8 bg-black/20 p-4"
            >
              <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.08]" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/[0.06]" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
          ))
        ) : similarCases.length > 0 ? (
          similarCases.map((item) => (
            <div key={item.id} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] ${verdictTone(item.decision)}`}
                >
                  {item.decision}
                </span>
                <span className="font-mono text-xs text-neutral-500">{item.hash}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-300">{item.summary}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">
                  Similarity {(item.similarity * 100).toFixed(0)}%
                </span>
                <Link
                  href={`/case/${item.id}`}
                  className="inline-flex items-center gap-1 text-sm text-neutral-300 transition hover:text-neutral-100"
                >
                  View case
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/8 bg-black/20 p-5 text-sm text-neutral-500">
            Not enough cases yet.
          </div>
        )}
      </div>
    </section>
  );
}
