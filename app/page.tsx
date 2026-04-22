import { DecisionReceiptLab } from "@/components/decision-receipt-lab";
import { demoRefusedReceipt, demoRefusedScenario } from "@/lib/demo-data";

type HomeProps = {
  searchParams?: {
    demo?: string;
  };
};

export default function Home({ searchParams }: HomeProps) {
  const isRefusedDemo = searchParams?.demo === "refused";

  return (
    <DecisionReceiptLab
      initialScenario={
        isRefusedDemo ? demoRefusedScenario : ""
      }
      initialReceipt={isRefusedDemo ? demoRefusedReceipt : null}
    />
  );
}
