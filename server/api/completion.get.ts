export default cachedEventHandler(
  async (event): Promise<Array<string>> => {
    const { query } = getQuery(event);

    const prompt = query?.toString().trim().toLowerCase();

    if (!prompt) return [];

    const emojisPromise = generateEmojis(prompt);

    const cachedEmojis = await getCachedEmojis(prompt);

    if (cachedEmojis.length) {
      emojisPromise.then((emojis) => {
        cacheEmojis(
          prompt,
          emojis.filter((emoji) => !cachedEmojis.includes(emoji))
        );
      });

      return cachedEmojis;
    }

    const emojis = await emojisPromise;

    cacheEmojis(prompt, emojis);

    return emojis;
  },
  { swr: true, maxAge: 1 }
);
