import { H3Event } from "h3"
import { OpenAIStream } from "ai"
import { Configuration, OpenAIApi } from "openai-edge"
import { kv } from "@vercel/kv"
import { Ratelimit } from "@upstash/ratelimit"

const { openaiApiKey: apiKey } = useRuntimeConfig()
const config = new Configuration({ apiKey })
const openai = new OpenAIApi(config)
const ratelimit = new Ratelimit({ redis: kv, limiter: Ratelimit.fixedWindow(20, "60s") })

export default eventHandler(async (event) => {
  const headers = getHeaders(event)
  const ip = headers["x-real-ip"] || headers["x-forwarded-for"]
  const { success } = await ratelimit.limit(ip ?? "anonymous")

  if (!success) return createError({ statusCode: 429, statusMessage: "Too Many Requests" })

  const prompt = await readBody(event).then((b) => b.prompt.trim().toLowerCase())

  const key = `emoji:${prompt}`

  const saved: string | null = await kv.get(key)

  if (saved) {
    return saved
  }

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 300,
    temperature: 0.5,
    top_p: 0.5,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
    stream: true,
    messages: [createMessage(prompt)],
  })

  const stream = OpenAIStream(response, {
    onCompletion: async (value) => {
      await kv.set(key, value)
    },
  })

  return streamResponse(event, stream)
})

const createMessage = (prompt: string) =>
  ({
    role: "system",
    content: `Generate 20 unique valid emojis that are most relevant to the prompt: "${prompt}". No emoji should be repeated. Do not include any spaces between the emojis. Do not include invalid emojis. If the combination of unicode characters is not a valid emoji do not include it.`,
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
