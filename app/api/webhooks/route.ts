import { randomUUID } from "crypto";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { listWebhooks, registerWebhook } from "@/lib/webhooks";
import { webhookRegistrationSchema } from "@/lib/schemas";

export async function GET() {
  const webhooks = await listWebhooks();
  return NextResponse.json({ webhooks });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = webhookRegistrationSchema.parse(payload);
    const result = await registerWebhook(input);

    return NextResponse.json({
      webhookId: result.webhook.id ?? randomUUID(),
      secret: result.secret,
      webhook: result.webhook,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid webhook payload." },
        { status: 400 },
      );
    }

    console.error("Webhook registration failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register webhook." },
      { status: 503 },
    );
  }
}
