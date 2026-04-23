# Ovrule SDK

TypeScript client for Ovrule case-file classification, guardrails, and receipt verification.

## Install

```bash
npm install ovrule
```

## 1. Simple classify

```ts
import { classify } from "ovrule";

const receipt = await classify("Support agent wants to refund $5,000 without manager approval.");

console.log(receipt.decision);
console.log(receipt.summary);
```

## 2. `guard()` around an agent tool call

```ts
import { guard } from "ovrule";

const result = await guard({
  scenario: "Finance agent wants to wire $18,000 to a new vendor after bank details changed.",
  policyPack: "finance",
});

if (!result.allowed) {
  console.error(result.decision, result.suggestedFixes);
  throw new Error("Tool call blocked by Ovrule.");
}

await issueWireTransfer();
```

## 3. LangChain middleware integration

```ts
import { OvruleClient } from "ovrule";

const ovrule = new OvruleClient({ baseUrl: "https://your-ovrule-deployment.vercel.app" });

export async function beforeToolInvoke(input: string) {
  const guard = await ovrule.guard({
    scenario: input,
    policyPack: "general",
  });

  if (!guard.allowed) {
    return {
      blocked: true,
      receipt: guard.receipt,
      fixes: guard.suggestedFixes,
    };
  }

  return { blocked: false };
}
```

## API

- `classify(action, options?)`
- `guard(action, options?)`
- `verify(receipt, signature)`
