import { DocsCodeBlock } from "@/components/docs-code-block";
import { StickyHeader } from "@/components/sticky-header";

const sections = [
  "Introduction",
  "SDK",
  "Authentication",
  "Classify",
  "Policy Packs",
  "Comparable Precedents",
  "Contest",
  "Override",
  "Verify",
  "Webhooks",
  "Rate limits",
] as const;

const classifyExampleResponse = `{
  "decision": "AMBIGUOUS",
  "scenario": "A shopping agent wants to auto-check out a saved cart 24 hours later.",
  "proposedAction": "Auto-check out a saved cart after a delayed reminder period.",
  "claimedGoal": "Complete a purchase on the user's behalf after a reminder delay.",
  "authorityBasis": "The user asked for a reminder, not explicit purchase execution.",
  "severity": "medium",
  "riskScore": 52,
  "summary": "The purchase intent boundary is unclear. Ovrule flags the action because consent and authorization are not explicit enough for autonomous checkout.",
  "ruleTrace": [
    { "rule": "SAFETY", "verdict": "WARN", "reason": "An autonomous purchase can create financial harm if the user did not intend to buy." },
    { "rule": "AUTHORIZATION", "verdict": "WARN", "reason": "A reminder request does not clearly authorize checkout execution." }
  ],
  "receiptId": "c83aa5e1-76b2-4e7b-8d38-68abf3f8cc78",
  "hash": "0d92a47ac11f",
  "signature": "base64-ed25519-signature",
  "timestamp": "2026-04-22T23:15:10.000Z"
}`;

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Developer docs</p>
            <nav className="mt-6 space-y-3 text-sm text-neutral-400">
              {sections.map((section) => (
                <a key={section} href={`#${section.toLowerCase().replace(/\s+/g, "-")}`} className="block transition hover:text-neutral-100">
                  {section}
                </a>
              ))}
            </nav>
          </aside>

          <div className="max-w-3xl space-y-16">
            <section id="introduction">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Introduction</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
                Ovrule API
              </h1>
              <div className="mt-6 rounded-[28px] border border-cyan-400/18 bg-cyan-400/[0.06] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">Get started</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-medium text-neutral-100">npm install ovrule-lab</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      Use the SDK when you want a typed client for classify, guard, and receipt verification.
                    </p>
                  </div>
                  <div className="min-w-[220px]">
                    <DocsCodeBlock language="bash" code={`npm install ovrule-lab`} />
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-5 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>
                  Ovrule turns proposed AI agent actions into case files. Instead of a raw model output, you get a verdict, a rule trace, a receipt hash, and a durable history of challenges and overrides.
                </p>
                <p>
                  Integrate it when your agents can trigger real consequences: money movement, customer messaging, account changes, moderation, automation, or anything else that should leave an audit trail.
                </p>
                <p>
                  The API is intentionally narrow: classify a case, contest a decision, record a reviewer override, and read the resulting case file surface from your own product.
                </p>
              </div>
            </section>

            <section id="sdk">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">SDK</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">TypeScript client</h2>
              <p className="mt-4 text-sm leading-8 text-neutral-400 sm:text-base">
                The `ovrule-lab` SDK wraps classify, guard, and verification flows with typed helpers so you can integrate the product without hand-rolling SSE parsing or receipt verification.
              </p>
              <div className="mt-6">
                <DocsCodeBlock language="bash" code={`npm install ovrule-lab`} />
              </div>
              <div className="mt-6 space-y-6">
                <DocsCodeBlock
                  language="typescript"
                  code={`import { classify } from "ovrule-lab";

const receipt = await classify(
  "Support agent wants to refund $5,000 without manager approval.",
  { baseUrl: "https://decision-receipt-lab.vercel.app" },
);

console.log(receipt.decision, receipt.summary);`}
                />
                <DocsCodeBlock
                  language="typescript"
                  code={`import { guard } from "ovrule-lab";

const result = await guard(
  {
    scenario: "Finance agent wants to wire $18,000 to a new vendor after bank details changed.",
    policyPack: "finance",
  },
  { baseUrl: "https://decision-receipt-lab.vercel.app" },
);

if (!result.allowed) {
  throw new Error(result.decision);
}

await issueWireTransfer();`}
                />
                <DocsCodeBlock
                  language="typescript"
                  code={`import { verify } from "ovrule-lab";

const valid = await verify(receipt, receipt.signature, {
  baseUrl: "https://decision-receipt-lab.vercel.app",
});

console.log({ valid });`}
                />
              </div>
              <p className="mt-6 text-sm leading-8 text-neutral-400 sm:text-base">
                Full SDK examples live in the repo:
                {" "}
                <a
                  href="https://github.com/elakumuk/decision-receipt-lab/blob/main/sdk/README.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 transition hover:text-cyan-200"
                >
                  sdk/README.md
                </a>
              </p>
            </section>

            <section id="authentication">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Authentication</p>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>Currently open for demo use with IP-based rate limiting. API key auth coming with Phase 2.</p>
                <p>
                  In the current build, requests are accepted directly by the deployed Next.js app. Production deployments should still restrict origin, rate-limit aggressively, and front the API with your own auth until native API keys land.
                </p>
              </div>
            </section>

            <section id="classify">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Classify</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">POST /api/classify</h2>
              <p className="mt-4 text-sm leading-8 text-neutral-400 sm:text-base">
                Opens a live classification stream and returns the case file when the audit completes.
              </p>
              <DocsCodeBlock
                language="json"
                code={`{
  "scenario": "Support agent wants to refund $5,000 without manager approval.",
  "policyPack": "customer_support"
}`}
              />
              <div className="mt-6 space-y-6">
                <DocsCodeBlock
                  language="bash"
                  code={`curl -N -X POST https://your-domain/api/classify \\
  -H "Content-Type: application/json" \\
  -d '{"scenario":"Support agent wants to refund $5,000 without manager approval."}'`}
                />
                <DocsCodeBlock
                  language="python"
                  code={`import requests

response = requests.post(
    "https://your-domain/api/classify",
    json={"scenario": "Support agent wants to refund $5,000 without manager approval."},
    stream=True,
)

for line in response.iter_lines():
    if line:
        print(line.decode())`}
                />
                <DocsCodeBlock
                  language="typescript"
                  code={`const response = await fetch("/api/classify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    scenario: "Support agent wants to refund $5,000 without manager approval.",
  }),
});

const reader = response.body?.getReader();`}
                />
              </div>
              <div className="mt-6">
                <DocsCodeBlock language="json" code={classifyExampleResponse} />
              </div>
            </section>

            <section id="policy-packs">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Policy Packs</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">Audit overlays for domain-specific risk</h2>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>
                  Policy packs modify the base six-rule audit with pack-specific guidance and deterministic post-LLM checks. They do not replace the model output; they merge into the returned `ruleTrace` and can escalate a rule from `PASS` to `WARN` or `FAIL`.
                </p>
                <p>
                  Pass `policyPack` in the `/api/classify` request body to audit under a stricter domain-specific standard.
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-neutral-100">General</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">
                    Default Ovrule behavior. No extra domain checks are applied beyond the standard six-rule audit.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-neutral-100">Customer Support</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">
                    Tightens authorization and safety around refunds, escalation thresholds, sensitive customer interactions, and precedent-setting exceptions.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-neutral-100">Healthcare</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">
                    Tightens safety, causal validity, and consent around PHI, clinical advice boundaries, and emergency or acute-risk scenarios.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-neutral-100">Finance</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">
                    Tightens safety, authorization, and reversibility around transfers, trades, disclosure issues, and material financial actions.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <DocsCodeBlock
                  language="bash"
                  code={`curl -N -X POST https://your-domain/api/classify \\
  -H "Content-Type: application/json" \\
  -d '{
    "scenario": "Support agent wants to refund $5,000 without manager approval.",
    "policyPack": "customer_support"
  }'`}
                />
              </div>
              <p className="mt-6 text-sm leading-8 text-neutral-400 sm:text-base">
                Deterministic checks run after the LLM audit and can escalate verdicts before the final decision is derived. Custom pack support is planned next: `Custom pack — coming soon`.
              </p>
            </section>

            <section id="comparable-precedents">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Comparable Precedents</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">Similar past cases</h2>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>
                  Ovrule generates a `text-embedding-3-small` embedding for each stored receipt using the proposed action, decision, and rule trace summary. The UI uses that embedding to surface three related cases for reviewer context.
                </p>
                <p>
                  Use `GET /api/similar/:id` to fetch the three closest prior receipts for a case. If the vector column is unavailable or the database has too few cases, Ovrule falls back to a lighter-weight similarity pass and may return an empty list.
                </p>
              </div>
              <div className="mt-6">
                <DocsCodeBlock
                  language="bash"
                  code={`curl https://your-domain/api/similar/c83aa5e1-76b2-4e7b-8d38-68abf3f8cc78`}
                />
              </div>
              <div className="mt-6">
                <DocsCodeBlock
                  language="json"
                  code={`{
  "similar": [
    {
      "id": "0c32ec20-3f28-453f-ad0b-5850a10efe36",
      "decision": "REFUSED",
      "summary": "Consent verification was missing for a customer-wide promotional email.",
      "hash": "9d5e640ea215",
      "timestamp": "2026-04-23T14:55:00.622Z",
      "similarity": 0.91
    }
  ]
}`}
                />
              </div>
            </section>

            <section id="contest">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Contest</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">POST /api/contest</h2>
              <DocsCodeBlock
                language="json"
                code={`{
  "receiptId": "c83aa5e1-76b2-4e7b-8d38-68abf3f8cc78",
  "reason": "This case omitted the user consent record attached to the account.",
  "category": "missing_context"
}`}
              />
            </section>

            <section id="override">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Override</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">POST /api/override</h2>
              <DocsCodeBlock
                language="json"
                code={`{
  "receiptId": "c83aa5e1-76b2-4e7b-8d38-68abf3f8cc78",
  "reviewerName": "Treasury lead",
  "overrideDecision": "annotate",
  "annotation": "Proceed only after callback verification and dual approval."
}`}
              />
            </section>

            <section id="verify">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Verify</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">POST /api/verify</h2>
              <p className="mt-4 text-sm leading-8 text-neutral-400 sm:text-base">
                Verify a signed receipt with Ovrule&apos;s signer. Fetch the public key from `GET /api/public-key`
                and inspect signer health from `GET /api/signing-health`.
              </p>
              <DocsCodeBlock
                language="json"
                code={`{
  "receipt": {
    "receiptId": "c83aa5e1-76b2-4e7b-8d38-68abf3f8cc78",
    "hash": "0d92a47ac11f",
    "signature": "base64-ed25519-signature"
  },
  "signature": "base64-ed25519-signature"
}`}
              />
            </section>

            <section id="webhooks">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Webhooks</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">Outbound event delivery</h2>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>
                  Register HTTPS endpoints from `/webhooks` or the API and Ovrule will POST signed payloads when receipts, contests, and reviewer overrides are created.
                </p>
                <p>
                  Every delivery includes `X-Ovrule-Signature`, an HMAC-SHA256 signature of the raw request body using the webhook secret returned at registration time.
                </p>
              </div>
              <div className="mt-6 space-y-6">
                <DocsCodeBlock
                  language="bash"
                  code={`curl -X POST https://your-domain/api/webhooks \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/ovrule",
    "events": ["receipt.created", "contest.created"]
  }'`}
                />
                <DocsCodeBlock
                  language="json"
                  code={`{
  "event": "receipt.created",
  "data": {
    "receiptId": "0c32ec20-3f28-453f-ad0b-5850a10efe36",
    "decision": "REFUSED",
    "policyPack": "customer_support"
  },
  "timestamp": "2026-04-23T14:55:00.622Z"
}`}
                />
                <DocsCodeBlock
                  language="typescript"
                  code={`import crypto from "crypto";

const expected = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");

const valid = signature === expected;`}
                />
              </div>
              <p className="mt-6 text-sm leading-8 text-neutral-400 sm:text-base">
                Management endpoints: `GET /api/webhooks`, `POST /api/webhooks`, `DELETE /api/webhooks/:id`, and `POST /api/webhooks/:id/test`.
              </p>
            </section>

            <section id="rate-limits">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Rate limits</p>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>`POST /api/classify` is currently limited to 10 requests per minute per IP.</p>
                <p>Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.</p>
                <p>Retry after the reset window rather than hammering the stream endpoint.</p>
              </div>
            </section>

          </div>
        </div>
      </section>
    </main>
  );
}
