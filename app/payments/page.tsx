import { StickyHeader } from "@/components/sticky-header";
import { PaymentsIntake } from "@/components/payments-intake";

export const metadata = {
  title: "Payment-change review — Ovrule",
  description:
    "Before your team wires money to a changed bank account, Ovrule reviews the request and tells you whether to hold, verify, or pay — with a signed record.",
};

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
            Accounts payable
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
            Don&apos;t wire the fraud.
          </h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
            &ldquo;Our bank account changed — please pay the invoice today&rdquo; is how companies lose billions to
            vendor fraud. Paste the request. Ovrule flags the red flags, tells you whether to hold, verify, or pay,
            and leaves a signed record of the decision.
          </p>
          <PaymentsIntake />
        </div>
      </section>
    </main>
  );
}
