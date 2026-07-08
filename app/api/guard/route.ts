import { ZodError, z } from "zod";
import { guardAction } from "@/lib/guard";

const guardRequestSchema = z.object({
  action: z.string().min(1, "action is required").max(4000),
  policyPack: z.enum(["general", "finance", "healthcare", "customer-support"]).optional(),
  blockOn: z.array(z.enum(["ADMISSIBLE", "AMBIGUOUS", "REFUSED"])).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { action, policyPack, blockOn } = guardRequestSchema.parse(payload);

    const guard = await guardAction(action, { policyPack, blockOn });

    // Return a compact gate response; the full signed receipt is included for audit.
    return Response.json(
      {
        allowed: guard.allowed,
        decision: guard.decision,
        reason: guard.reason,
        receiptId: guard.receipt.receiptId,
        signature: guard.receipt.signature,
        ruleTrace: guard.receipt.ruleTrace,
      },
      { status: guard.allowed ? 200 : 403 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid request body." }, { status: 400 });
    }

    console.error("Guard request failed", error);
    return Response.json({ error: "The guard is temporarily unavailable." }, { status: 503 });
  }
}
