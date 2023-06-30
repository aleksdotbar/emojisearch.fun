import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream } from "ai"
import { kv } from "@vercel/kv"
import { H3Event } from "h3"
import { Ratelimit } from "@upstash/ratelimit"

const { openaiApiKey: apiKey } = useRuntimeConfig()
const config = new Configuration({ apiKey })
const openai = new OpenAIApi(config)
const ratelimit = new Ratelimit({ redis: kv, limiter: Ratelimit.fixedWindow(10, "60s") })

export default eventHandler(async (event) => {
  const headers = getHeaders(event)
  const ip = headers["x-real-ip"] || headers["x-forwarded-for"]
  const { success } = await ratelimit.limit(ip ?? "anonymous")

  if (!success) return createError({ statusCode: 429, statusMessage: "Too Many Requests" })

  let { prompt } = await readBody(event)

  prompt = prompt.trim()

  const key = `emoji:${prompt}`

  const saved: string | null = await kv.get(key)

  if (saved) return saved

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.3,
    max_tokens: 50,
    top_p: 0.2,
    frequency_penalty: 0.6,
    presence_penalty: 1,
    stream: true,
    messages: [createMessage(prompt)],
  })

  const stream = OpenAIStream(response, {
    onCompletion: async (value) => {
      await kv.set(key, value)
      await kv.expire(key, 60 * 60 * 24)
    },
  })

  return streamResponse(event, stream)
})

const createMessage = (prompt: string) =>
  ({
    role: "system",
    content: `Generate a sequence of unique signle emojis, each separated by a space, that are relevant to the concept of ${prompt}.  Each emoji should be a standalone symbol and distinct, with no repetitions or combinations of emojis.`,
  } as const)

const streamResponse = (event: H3Event, stream: ReadableStream) => {
  event._handled = true

  // @ts-expect-error _data will be there.
  event.node.res._data = stream

  if (event.node.res.socket) {
    stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk)
        },
        close() {
          event.node.res.end()
        },
      })
    )
  }
}
