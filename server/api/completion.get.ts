export default eventHandler(async (event): Promise<Array<string>> => {
  const { query } = getQuery(event);

  const prompt = query?.toString().trim();

  if (!prompt) return [];

  const emojis = await getEmojis(prompt);

  return emojis;
});
