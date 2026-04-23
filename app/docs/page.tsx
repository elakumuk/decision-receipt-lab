import { DocsCodeBlock } from "@/components/docs-code-block";
import { StickyHeader } from "@/components/sticky-header";

const sections = [
  "Introduction",
  "Authentication",
  "Classify",
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
                    <p className="text-base font-medium text-neutral-100">npm install ovrule</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      Use the SDK when you want a typed client for classify, guard, and receipt verification.
                    </p>
                  </div>
                  <div className="min-w-[220px]">
                    <DocsCodeBlock language="bash" code={`npm install ovrule`} />
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

            <section id="authentication">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Authentication</p>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>Currently open for demo use; API key auth coming with Phase 2.</p>
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
  "scenario": "Support agent wants to refund $5,000 without manager approval."
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
              <p className="mt-4 text-sm leading-8 text-neutral-400 sm:text-base">
                Coming soon: `receipt.created`, `contest.created`, and `override.created` webhook delivery for downstream audit pipelines.
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

            <section>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Coming soon</p>
              <div className="mt-4 space-y-4 text-sm leading-8 text-neutral-400 sm:text-base">
                <p>Policy packs: organization-specific rule overlays for internal governance.</p>
                <p>Comparable precedents: retrieve similar prior case files to anchor reviewer decisions.</p>
                <p>Webhooks: forward receipt and contest activity directly into your own systems.</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
