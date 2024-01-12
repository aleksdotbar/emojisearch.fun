import { Configuration, OpenAIApi } from "openai-edge";
import { kv } from "@vercel/kv";

const { openaiApiKey: apiKey } = useRuntimeConfig();
const config = new Configuration({ apiKey });
const openai = new OpenAIApi(config);

const key = (prompt: string) => `emoji:${prompt}`;

const cacheEmojis = async (prompt: string, emojis: string[]) => {
  await kv.sadd(key(prompt), ...uniq(emojis));
};

const getCachedEmojis = async (prompt: string) => {
  const emojis = await kv.smembers(key(prompt));

  return emojis.sort().filter((c) => c !== "‍");
};

const getEmojis = async (prompt: string) => {
  const {
    choices: [{ message }],
  } = await openai
    .createChatCompletion({
      messages: createMessages(prompt),
      model: "gpt-3.5-turbo",
      max_tokens: 256,
      temperature: 0.8,
      top_p: 0.5,
      frequency_penalty: 0.6,
      presence_penalty: 1,
    })
    .then((r) => r.json());

  return uniq(splitEmojis(message.content)).sort();
};

export default eventHandler(async (event) => {
  const query = getQuery(event);

  const prompt = query.prompt?.toString().trim();

  if (!prompt) {
    return [];
  }

  const cached = await getCachedEmojis(prompt);

  if (cached.length) {
    getEmojis(prompt).then((emojis) => cacheEmojis(prompt, [...cached, ...emojis]));

    return cached;
  }

  const emojis = await getEmojis(prompt);

  cacheEmojis(prompt, emojis);

  return emojis;
});
