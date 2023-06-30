export const splitEmojis = (text: string) => (text ? Array.from(new Set(text.split(" "))) : [])
