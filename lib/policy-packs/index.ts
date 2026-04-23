import type { PolicyPackId } from "@/lib/schemas";
import { customerSupportPolicyPack } from "@/lib/policy-packs/customer-support";
import { financePolicyPack } from "@/lib/policy-packs/finance";
import { generalPolicyPack } from "@/lib/policy-packs/general";
import { healthcarePolicyPack } from "@/lib/policy-packs/healthcare";

export const policyPacks = {
  general: generalPolicyPack,
  customer_support: customerSupportPolicyPack,
  healthcare: healthcarePolicyPack,
  finance: financePolicyPack,
} as const;

export function getPolicyPack(id: PolicyPackId = "general") {
  return policyPacks[id] ?? policyPacks.general;
}

export function getPolicyPackOptions() {
  return Object.values(policyPacks).map((pack) => ({
    id: pack.id,
    label: pack.label,
  }));
}
