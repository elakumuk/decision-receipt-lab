import { getSigningHealth } from "@/lib/signing";

export async function GET() {
  return Response.json(getSigningHealth());
}
