import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { kv } from "@vercel/kv"

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY })

const openai = new OpenAIApi(config)

export const runtime = "edge"

export const POST = async (req: Request) => {
  const { messages } = await req.json()

  const prompt = messages.at(-1)?.content.trim()

  const key = `emoji:${prompt}`

  const saved: string | null = await kv.get(key)

  if (saved) {
    return new Response(saved)
  }

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0.1,
    presence_penalty: 1,
    stream: true,
    messages: [
      {
        role: "system",
        content: `List as many unicode emojis as you can related to the theme ${prompt}, up to 100 tokens, return just emojis`,
      },
    ],
  })

  const stream = OpenAIStream(response, {
    onCompletion: async (value) => {
      await kv.set(key, value)
      await kv.expire(key, 60 * 60 * 24)
    },
  })

  return new StreamingTextResponse(stream)
}
