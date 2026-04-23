import { ZodError } from "zod";
import { classifyScenarioStream } from "@/lib/classifier";
import { checkClassifyRateLimit, getRequestIp } from "@/lib/rate-limit";
import { classifyScenarioSchema, classifyStreamEventSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const rateLimit = await checkClassifyRateLimit(ip);

    if (!rateLimit.success) {
      return Response.json(
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
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventName: string, payloadToSend: unknown) => {
          controller.enqueue(encoder.encode(`event: ${eventName}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payloadToSend)}\n\n`));
        };

        try {
          for await (const event of classifyScenarioStream(scenario)) {
            const parsedEvent = classifyStreamEventSchema.parse(event);
            sendEvent(parsedEvent.type, parsedEvent);
          }
        } catch (error) {
          console.error("Classification stream failed", error);
          sendEvent("session.error", {
            type: "session.error",
            message: "The classifier is temporarily unavailable. Please try again in a moment.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.reset),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400 },
      );
    }

    console.error("Classification request failed", error);
    return Response.json(
      {
        error: "The classifier is temporarily unavailable. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
