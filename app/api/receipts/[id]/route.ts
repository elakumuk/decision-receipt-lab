import { getCaseFileById } from "@/lib/receipts";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const receipt = await getCaseFileById(params.id);

  if (!receipt) {
    return Response.json(
      {
        error: "Receipt not found.",
      },
      { status: 404 },
    );
  }

  return Response.json(receipt);
}
