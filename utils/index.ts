import Graphemer from "graphemer"

const splitter = new Graphemer()

// export const splitEmojis = (text: string) => (text ? text.split(" ") : [])
export const splitEmojis = (text: string) =>
  text ? splitter.splitGraphemes(text.replace(/\s/g, "")) : []
