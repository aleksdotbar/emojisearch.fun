import GraphemeSplitter from "grapheme-splitter"

const splitter = new GraphemeSplitter()

export const splitEmojis = (text: string) =>
  (text ? Array.from(new Set(text.split(" "))) : []).filter((v) => splitter.countGraphemes(v) === 1)
