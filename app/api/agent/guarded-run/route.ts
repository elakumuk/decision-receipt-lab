import { ZodError, z } from "zod";
import { Maritime } from "maritime-sdk";
import { guardAction } from "@/lib/guard";

// Ela's deployed OpenClaw agent on Maritime (override with MARITIME_AGENT_ID).
const AGENT_ID = process.env.MARITIME_AGENT_ID ?? "1b84cf32-2b70-4bf8-afa6-9aab278bab04";

const schema = z.object({
  task: z.string().min(1, "task is required").max(4000),
  policyPack: z.enum(["general", "finance", "healthcare", "customer-support"]).optional(),
});

/**
 * Guarded run: send a task to a REAL agent running on Maritime, then audit what
 * the agent proposes to do through Ovrule BEFORE it acts. A REFUSED plan returns
 * 403 so the agent's action is blocked at the gate — real agent, real guard.
 */
export async function POST(request: Request) {
  try {
    const { task, policyPack } = schema.parse(await request.json());

    const apiKey = process.env.MARITIME_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "MARITIME_API_KEY is not set." }, { status: 500 });
    }

    const maritime = new Maritime({ apiKey });
    const { response } = await maritime.agents.chat(AGENT_ID, task);

    const guard = await guardAction(response, { policyPack });

    return Response.json(
      {
        agentId: AGENT_ID,
        task,
        agentResponse: response,
        guard: {
          allowed: guard.allowed,
          decision: guard.decision,
          reason: guard.reason,
          receiptId: guard.receipt.receiptId,
          signature: guard.receipt.signature,
          ruleTrace: guard.receipt.ruleTrace,
        },
      },
      { status: guard.allowed ? 200 : 403 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid request body." }, { status: 400 });
    }
    console.error("guarded-run failed", error);
    return Response.json({ error: (error as Error)?.message ?? "guarded-run failed" }, { status: 502 });
  }
}
