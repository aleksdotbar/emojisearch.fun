import Graphemer from "graphemer"

export const splitEmojis = (text: string) =>
  text ? new Graphemer().splitGraphemes(text.replace(/\s/g, "")) : []
