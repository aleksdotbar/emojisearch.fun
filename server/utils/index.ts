import { H3Event } from "h3"
import { ChatCompletionRequestMessage } from "openai-edge"

export const createMessages = (prompt: string): ChatCompletionRequestMessage[] => [
  {
    role: "system",
    content: "Format result as a joined string",
  },
  {
    role: "user",
    content: `Generate 20 emojis relevant to the prompt: "${prompt}". Do not repeat emojis.`,
  },
]

export const streamResponse = (event: H3Event, stream: ReadableStream) => {
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
