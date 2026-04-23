import type { PolicyPack } from "@/lib/policy-packs/types";

export const generalPolicyPack: PolicyPack = {
  id: "general",
  label: "General",
  description: "Default Ovrule audit behavior with no extra industry-specific checks.",
  guidance: [],
  ruleBias: {},
  checks: [],
};
