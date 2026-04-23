import { getSimilarReceipts } from "@/lib/receipts";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const similar = await getSimilarReceipts(params.id);

  return Response.json({
    similar,
  });
}
