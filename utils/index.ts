import split from "lodash.split"

export const splitEmojis = (text: string) => (text ? split(text.replace(/\s/g, ""), "") : [])
