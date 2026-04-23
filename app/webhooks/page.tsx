import { StickyHeader } from "@/components/sticky-header";
import { WebhooksConsole } from "@/components/webhooks-console";

export default function WebhooksPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              Webhooks
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
              Outbound events for your audit pipeline
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              Register HTTPS endpoints to receive signed notifications when Ovrule creates
              receipts, records contests, or accepts reviewer overrides.
            </p>
          </div>

          <div className="mt-10">
            <WebhooksConsole />
          </div>
        </div>
      </section>
    </main>
  );
}
