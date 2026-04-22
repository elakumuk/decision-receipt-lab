import { NextResponse } from "next/server";
import { sha256 } from "@/lib/hash";
import { contestDecisionSchema } from "@/lib/schemas";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = contestDecisionSchema.parse(payload);
    const receiptId = sha256(`${input.decision}:${input.rationale}:${input.userEmail ?? "anonymous"}`);
    const supabase = getSupabaseClient();
    let stored = false;

    if (supabase) {
      const { error } = await supabase.from("decision_contests").insert({
        receipt_id: receiptId,
        decision: input.decision,
        rationale: input.rationale,
        user_email: input.userEmail ?? null,
      });

      if (!error) {
        stored = true;
      }
    }

    return NextResponse.json({
      receiptId,
      stored,
      message: stored
        ? "Contest receipt recorded."
        : "Contest receipt generated. Configure Supabase to persist submissions.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit contest.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
