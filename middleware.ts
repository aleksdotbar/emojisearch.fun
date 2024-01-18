import { Ratelimit } from "@upstash/ratelimit";
import type { RequestContext } from "@vercel/edge";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({ redis: kv, limiter: Ratelimit.fixedWindow(30, "60s") });

const middleware = async ({ headers }: Request, context: RequestContext) => {
  const ip = headers.get("x-real-ip") ?? headers.get("x-forwarded-for") ?? "anonymous";

  const { success, pending } = await ratelimit.limit(ip);

  context.waitUntil(pending);

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }
};

export const config = {
  matcher: ["/api/completion"],
};

export default middleware;
