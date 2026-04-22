import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let ratelimit: Ratelimit | null = null;

function getRatelimit() {
  if (ratelimit) {
    return ratelimit;
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "decision-receipt-lab:classify",
  });

  return ratelimit;
}

export async function checkClassifyRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRatelimit();

  if (!limiter) {
    return {
      success: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 60_000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return realIp ?? "unknown";
}
