import { OpenAIStream } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import { kv } from "@vercel/kv";

const { openaiApiKey: apiKey } = useRuntimeConfig();
const config = new Configuration({ apiKey });
const openai = new OpenAIApi(config);

export default eventHandler(async (event) => {
  const prompt = await readBody(event).then((b) => b.prompt.trim().toLowerCase());

  const key = `emoji:${prompt}`;

  const saved: string | null = await kv.get(key);

  if (saved) {
    return saved;
  }

  const response = await openai.createChatCompletion({
    messages: createMessages(prompt),
    model: "gpt-3.5-turbo",
    max_tokens: 256,
    temperature: 0.8,
    top_p: 0.5,
    frequency_penalty: 0.6,
    presence_penalty: 1,
    stream: true,
  });

  const stream = OpenAIStream(response, {
    onCompletion: async (value) => {
      await kv.set(key, value);
    },
  });

  return streamResponse(event, stream);
});
