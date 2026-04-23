import { randomUUID } from "crypto";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { overrideDecisionSchema } from "@/lib/schemas";
import { getServerSupabaseClient } from "@/lib/supabase";
import { triggerWebhookEvent } from "@/lib/webhooks";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = overrideDecisionSchema.parse(payload);
    const supabase = getServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Reviewer overrides are not configured right now." },
        { status: 503 },
      );
    }

    const createdAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("receipt_overrides")
      .insert({
        receipt_id: input.receiptId,
        reviewer_name: input.reviewerName,
        override_decision: input.overrideDecision,
        annotation: input.annotation,
        created_at: createdAt,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert override", error);
      return NextResponse.json(
        { error: "Unable to log this override right now." },
        { status: 503 },
      );
    }

    const historyId = randomUUID();
    const { error: historyError } = await supabase.from("receipt_history").insert({
      id: historyId,
      receipt_id: input.receiptId,
      event_type: "overridden",
      actor_type: "human_reviewer",
      actor_label: input.reviewerName,
      note: input.annotation,
      payload: {
        overrideId: data.id,
        overrideDecision: input.overrideDecision,
      },
      created_at: createdAt,
    });

    if (historyError) {
      console.error("Failed to insert override history", historyError);
    }

    await triggerWebhookEvent("override.created", {
      overrideId: data.id,
      receiptId: input.receiptId,
      reviewerName: input.reviewerName,
      overrideDecision: input.overrideDecision,
      annotation: input.annotation,
      createdAt,
    });

    return NextResponse.json({
      success: true,
      overrideId: data.id,
      historyEventId: historyId,
      createdAt,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    console.error("Override request failed", error);

    return NextResponse.json(
      { error: "Unable to log this override right now." },
      { status: 503 },
    );
  }
}
