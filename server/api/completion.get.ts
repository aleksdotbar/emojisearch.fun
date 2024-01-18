export default eventHandler(async (event): Promise<Array<string>> => {
  const { query } = getQuery(event);

  const prompt = query?.toString().trim().toLowerCase();

  if (!prompt) return [];

  const [emojis, cachedEmojis] = await Promise.all([
    generateEmojis(prompt),
    getCachedEmojis(prompt),
  ]);

  setHeader(event, "Cache-Control", "public, s-max-age=1, stale-while-revalidate=59");

  if (!cachedEmojis.length) {
    await cacheEmojis(prompt, emojis);

    return emojis;
  }

  const newEmojis = emojis.filter((emoji) => !cachedEmojis.includes(emoji));

  await cacheEmojis(prompt, newEmojis);

  return [...cachedEmojis, ...newEmojis];
});
