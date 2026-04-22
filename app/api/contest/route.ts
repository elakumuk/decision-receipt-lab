import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { contestDecisionSchema } from "@/lib/schemas";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = contestDecisionSchema.parse(payload);
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Contest logging is not configured right now." },
        { status: 503 },
      );
    }

    const { data, error } = await supabase
      .from("contests")
      .insert({
        receipt_id: input.receiptId,
        reason: input.reason,
        category: input.category,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert contest", error);
      return NextResponse.json(
        { error: "Unable to log this contest right now." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      contestId: data.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    console.error("Contest request failed", error);
    return NextResponse.json(
      { error: "Unable to log this contest right now." },
      { status: 503 },
    );
  }
}
