import { NextResponse } from "next/server";
import { sendTestWebhook } from "@/lib/webhooks";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const result = await sendTestWebhook(params.id);

    return NextResponse.json({
      success: true,
      event: result.event,
      maskedSecret: result.maskedSecret,
    });
  } catch (error) {
    console.error("Webhook test failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to deliver webhook test." },
      { status: 503 },
    );
  }
}
