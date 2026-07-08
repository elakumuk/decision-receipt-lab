import { guardTool, GuardBlockedError } from "@/lib/guard";

/**
 * Demo of the drop-in wrapper: an agent has two real tools. Each is wrapped with
 * guardTool() in one line, so Ovrule audits the intended action BEFORE the tool
 * runs. The dangerous transfer is blocked and never executes; the safe tool runs.
 */

// --- the agent's real tools (the side effects we care about) ---
async function summarizeDoc(doc: string): Promise<string> {
  return `Summary of "${doc}" generated.`;
}

async function wireTransfer(args: { amount: number; to: string }): Promise<string> {
  // In a real agent this would move money. It must never run when blocked.
  return `MONEY MOVED: $${args.amount} to ${args.to}`;
}

// --- one-line adoption: wrap each tool with the Ovrule guard ---
const guardedSummarize = guardTool(summarizeDoc, (doc) => `Summarize the document: ${doc}`);
const guardedTransfer = guardTool(
  wireTransfer,
  (a) => `Transfer $${a.amount} to a new vendor bank account ${a.to} from an urgent invoice email`,
  { policyPack: "finance" },
);

async function runStep(
  tool: string,
  call: () => Promise<{ result: unknown; guard: { decision: string } }>,
) {
  try {
    const { result, guard } = await call();
    return { tool, allowed: true, decision: guard.decision, executed: result };
  } catch (error) {
    if (error instanceof GuardBlockedError) {
      return {
        tool,
        allowed: false,
        decision: error.result.decision,
        executed: null,
        blockedReason: error.result.reason,
      };
    }
    throw error;
  }
}

export async function GET() {
  const trace = [];
  // Step 1: agent decides to summarize a report (safe)
  trace.push(await runStep("summarizeDoc", () => guardedSummarize("Q3 report")));
  // Step 2: agent decides to wire money to a new vendor (dangerous)
  trace.push(await runStep("wireTransfer", () => guardedTransfer({ amount: 5000, to: "acct-9931" })));

  return Response.json({ agent: "demo-agent", trace });
}
