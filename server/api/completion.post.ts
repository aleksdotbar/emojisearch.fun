import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream } from "ai"
import { kv } from "@vercel/kv"
import { H3Event } from "h3"

const { openaiApiKey: apiKey } = useRuntimeConfig()
const config = new Configuration({ apiKey })
const openai = new OpenAIApi(config)

export default eventHandler(async (event) => {
  let { prompt } = await readBody(event)

  prompt = prompt.trim()

  const key = `emoji:${prompt}`

  const saved: string | null = await kv.get(key)

  if (saved) return saved

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0.1,
    presence_penalty: 2,
    stream: true,
    messages: [
      {
        role: "system",
        content: `List as many unicode emojis as you can related to the theme ${prompt}, up to 100 tokens. Emojis should be separated by a single space, do not repeat emojis, do not use compound emojis, do not combine graphemes to form emojis like this 🐾🌕`,
      },
    ],
  })

  const stream = OpenAIStream(response, {
    onCompletion: async (value) => {
      await kv.set(key, value)
      await kv.expire(key, 60 * 60 * 24)
    },
  })

  return streamResponse(event, stream)
})

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
