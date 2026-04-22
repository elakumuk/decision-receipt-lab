import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { classifyScenario } from "@/lib/classifier";
import { checkClassifyRateLimit, getRequestIp } from "@/lib/rate-limit";
import { classifyScenarioSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const rateLimit = await checkClassifyRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Please wait a minute before trying again.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        },
      );
    }

    const payload = await request.json();
    const { scenario } = classifyScenarioSchema.parse(payload);
    const receipt = await classifyScenario(scenario);

    return NextResponse.json(receipt, {
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.reset),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400 },
      );
    }

    console.error("Classification request failed", error);

    return NextResponse.json(
      {
        error: "The classifier is temporarily unavailable. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
