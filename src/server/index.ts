import type { GatewayProviderOptions } from "@ai-sdk/gateway";
import type { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { zValidator } from "@hono/zod-validator";
import { createGateway, embed, generateText, Output } from "ai";
import emojilib from "emojilib";
import { Hono } from "hono";
import { createWorkersAI } from "workers-ai-provider";
import * as z from "zod";
import { prompt, systemPrompt } from "./prompt";

const SELECTOR_MODEL = "openai/gpt-oss-120b";
const EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5";
const MATCH_TOP_K = 100;
const SEARCH_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;
const MIN_EMOJIS_TO_CACHE = 10;

const app = new Hono<{ Bindings: Env }>()
  .basePath("/api")

  .get(
    "/emojis/search",
    zValidator(
      "query",
      z.object({
        query: z.string().min(1).max(80),
      }),
      (result, c) => {
        if (!result.success) {
          for (const issue of result.error.issues) {
            if (issue.code === "too_big") {
              return c.json(
                { ok: false as const, error: { code: "QUERY_TOO_LONG" as const } },
                400
              );
            }
          }

          return c.json({ ok: false as const, error: { code: "INVALID_QUERY" as const } }, 400);
        }
      }
    ),
    async (c) => {
      const { query } = c.req.valid("query");

      const { success } = await c.env.RATE_LIMITER.limit({ key: getRateLimitKey(c) });
      if (!success) {
        return c.json({ ok: false, error: { code: "RATE_LIMIT_EXCEEDED" as const } }, 429);
      }

      const emojis = await searchEmojis(c.env, query);

      return c.json({ ok: true, emojis });
    }
  );

async function searchEmojis(env: Env, query: string): Promise<Array<string>> {
  const normalizedQuery = normalizeQuery(query);
  const searchCacheKey = `search:${SELECTOR_MODEL}:${normalizedQuery}`;

  // const cachedSearch = await env.EMOJI_CACHE.get<Array<string>>(searchCacheKey, "json");
  // if (cachedSearch?.length) {
  //   return cachedSearch;
  // }

  const candidates = await getMatches(env, normalizedQuery);

  const gateway = createGateway({ apiKey: env.AI_GATEWAY_API_KEY });

  const { output } = await generateText({
    model: gateway(SELECTOR_MODEL),
    system: systemPrompt(),
    prompt: prompt(normalizedQuery, candidates),
    temperature: 0,
    timeout: 10_000,
    providerOptions: {
      gateway: {
        order: ["cerebras"],
      } satisfies GatewayProviderOptions,
      openai: {
        reasoningEffort: "low",
      } satisfies OpenAIResponsesProviderOptions,
    },
    output: Output.object({
      schema: z.object({
        emojis: z.array(z.string()),
      }),
    }),
  });

  const emojis = dedupeEmojis(output.emojis);

  // if (emojis.length >= MIN_EMOJIS_TO_CACHE) {
  //   await env.EMOJI_CACHE.put(searchCacheKey, JSON.stringify(emojis), {
  //     expirationTtl: SEARCH_CACHE_TTL_SECONDS,
  //   });
  // }

  return emojis;
}

export default app;

export type AppType = typeof app;

type MatchedEmoji = {
  id: string;
  keywords: Array<string>;
};

async function getMatches(env: Env, normalizedQuery: string): Promise<Array<MatchedEmoji>> {
  const matchesCacheKey = `matches:${EMBEDDING_MODEL}:${MATCH_TOP_K}:${normalizedQuery}`;
  // const cachedMatches = await env.EMOJI_CACHE.get<Array<MatchedEmoji>>(matchesCacheKey, "json");

  // if (cachedMatches?.length) {
  //   return cachedMatches;
  // }

  const workersAI = createWorkersAI({ binding: env.AI });

  const { embedding } = await embed({
    model: workersAI.textEmbedding(
      EMBEDDING_MODEL as Parameters<typeof workersAI.textEmbedding>[0]
    ),
    value: normalizedQuery,
  });

  const result = await env.VECTORIZE.query(embedding, { topK: MATCH_TOP_K });

  const matchedEmojis = result.matches.map((match) => ({
    id: match.id,
    keywords: emojilib[match.id] ?? [],
  }));

  // await env.EMOJI_CACHE.put(matchesCacheKey, JSON.stringify(matchedEmojis));

  return matchedEmojis;
}

function dedupeEmojis(emojis: Array<string>) {
  const unique: Array<string> = [];
  const seen = new Set<string>();

  for (const emoji of emojis) {
    if (!isValidEmoji(emoji)) {
      continue;
    }

    const key = normalizeEmoji(emoji);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(emoji);
  }

  return unique;
}

function isValidEmoji(emoji: string) {
  return z.emoji().safeParse(emoji).success;
}

function normalizeEmoji(emoji: string) {
  return emoji.replace(/[\uFE0E\uFE0F]/g, "");
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function getRateLimitKey(c: { req: { header: (name: string) => string | undefined } }) {
  const forwarded = c.req.header("x-forwarded-for");
  const ip =
    c.req.header("cf-connecting-ip") ??
    (forwarded ? forwarded.split(",")[0]?.trim() : undefined) ??
    "unknown";

  return `search:${ip}`;
}
