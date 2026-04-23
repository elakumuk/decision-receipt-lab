import { getPublicKeyBase64, getSignerName } from "@/lib/signing";

export async function GET() {
  return Response.json({
    publicKey: getPublicKeyBase64(),
    signer: getSignerName(),
  });
}
