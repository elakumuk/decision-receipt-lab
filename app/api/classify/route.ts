import { NextResponse } from "next/server";
import { classifyDecision } from "@/lib/classifier";
import { classifyDecisionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = classifyDecisionSchema.parse(payload);
    const result = await classifyDecision(input);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to classify decision.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
