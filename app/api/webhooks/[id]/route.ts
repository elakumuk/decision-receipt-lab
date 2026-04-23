import { NextResponse } from "next/server";
import { deleteWebhook } from "@/lib/webhooks";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await deleteWebhook(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook deletion failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete webhook." },
      { status: 503 },
    );
  }
}
