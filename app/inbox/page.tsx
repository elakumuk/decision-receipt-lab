import { StickyHeader } from "@/components/sticky-header";
import { InboxClient } from "@/components/inbox-client";
import { inboxCases } from "@/lib/inbox-data";

export const metadata = {
  title: "Accountable Owner Inbox — Ovrule",
  description:
    "The actions your AI agents want to take that need a human decision — in plain English, for the person who's accountable.",
};

export default function InboxPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              Your AI agent
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
              Should it do this?
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              The things your AI agent wants to do on your behalf — send that email, make that purchase, share that
              file — and the ones you should <span className="text-neutral-200">okay first</span>. In plain English.
              Approve or deny, and your reason becomes part of a signed record.
            </p>
          </div>
          <InboxClient cases={inboxCases} />
        </div>
      </section>
    </main>
  );
}
