import { type RequestContext, json } from "@vercel/edge";
import { getCachedEmojis, cacheEmojis, generateEmojis } from "./_utils";

export const config = {
  runtime: "edge",
};

export default async (req: Request, ctx: RequestContext): Promise<Response> => {
  const { searchParams } = new URL(req.url);

  const prompt = searchParams.get("query")?.trim().toLowerCase();

  if (!prompt) {
    return json({ error: "Missing query" }, { status: 400 });
  }

  const emojisPromise = generateEmojis(prompt);

  const cachedEmojis = await getCachedEmojis(prompt);

  if (!cachedEmojis.length) {
    const emojis = await emojisPromise;

    ctx.waitUntil(cacheEmojis(prompt, emojis));

    return json(emojis);
  }

  ctx.waitUntil(
    emojisPromise.then((emojis) =>
      cacheEmojis(
        prompt,
        emojis.filter((emoji) => !cachedEmojis.includes(emoji))
      )
    )
  );

  return json(cachedEmojis);
};
