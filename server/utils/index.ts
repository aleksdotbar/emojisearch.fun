import { ChatCompletionRequestMessage } from "openai-edge";
import split from "lodash.split";

export const createMessages = (prompt: string): ChatCompletionRequestMessage[] => [
  {
    role: "system",
    content: "Format result as a joined string",
  },
  {
    role: "user",
    content: `Generate 20 emojis relevant to the prompt: "${prompt}". Do not repeat emojis.`,
  },
];

export const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

export const splitEmojis = (text: string) => (text ? split(text.replace(/\s/g, ""), "") : []);
