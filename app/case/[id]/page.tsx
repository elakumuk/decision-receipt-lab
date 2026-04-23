import { notFound } from "next/navigation";
import { CaseFileReadonly } from "@/components/case-file-readonly";
import { StickyHeader } from "@/components/sticky-header";
import { getCaseFileById } from "@/lib/receipts";

type CasePageProps = {
  params: {
    id: string;
  };
};

export default async function CasePage({ params }: CasePageProps) {
  const receipt = await getCaseFileById(params.id);

  if (!receipt) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <CaseFileReadonly receipt={receipt} shared />
        </div>
      </section>
    </main>
  );
}
