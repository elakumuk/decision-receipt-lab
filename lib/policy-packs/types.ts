import type { RuleName } from "@/lib/schemas";

export type PolicyBias = "stricter" | "default";
export type PolicyCheckEffect = "warn" | "fail";

export type PolicyCheckResult = {
  hits: boolean;
  effect: PolicyCheckEffect;
  reason: string;
};

export type PolicyCheck = {
  id: string;
  description: string;
  appliesTo: RuleName[];
  evaluate: (scenario: string) => PolicyCheckResult;
};

export type PolicyPack = {
  id: "general" | "customer_support" | "healthcare" | "finance";
  label: string;
  description: string;
  guidance: string[];
  ruleBias: Partial<Record<RuleName, PolicyBias>>;
  checks: PolicyCheck[];
};
