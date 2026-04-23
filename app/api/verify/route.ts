import { ZodError } from "zod";
import { getSignerName, verifyReceiptSignature } from "@/lib/signing";
import { verifyReceiptRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { receipt, signature } = verifyReceiptRequestSchema.parse(payload);

    return Response.json({
      valid: verifyReceiptSignature(receipt, signature),
      signer: getSignerName(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Invalid verification payload.",
        },
        { status: 400 },
      );
    }

    console.error("Receipt verification failed", error);
    return Response.json(
      {
        error: "Unable to verify the receipt right now.",
      },
      { status: 503 },
    );
  }
}
