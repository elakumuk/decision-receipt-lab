import { StickyHeader } from "@/components/sticky-header";
import { AgentConsole } from "@/components/agent-console";

export const metadata = {
  title: "Agent console — Ovrule",
  description:
    "Watch Ovrule guard an AI coding agent live: try a dangerous command and see it blocked before it runs.",
};

export default function AgentPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Agent console</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
            Your AI agent, on a leash.
          </h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
            Coding agents get shell, database, and API access — and sometimes run{" "}
            <span className="font-mono text-neutral-200">DROP TABLE users</span> on production to &ldquo;clean up.&rdquo;
            Try a command below. Ovrule reviews the action and blocks the dangerous, irreversible ones{" "}
            <span className="text-neutral-200">before they run</span>.
          </p>
          <AgentConsole />
        </div>
      </section>
    </main>
  );
}
