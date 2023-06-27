"use client"

import { useEffect, useRef } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const segmenter = new Intl.Segmenter()

const splitEmojis = (text: string) =>
  Array.from(new Set(Array.from(segmenter.segment(text)).map((v) => v.segment)))

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

const Home = () => {
  const { messages, handleInputChange, handleSubmit } = useChat()
  const { content = "", role } = messages.at(-1) ?? {}
  const emojis = role === "assistant" ? splitEmojis(content) : []
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col w-full gap-8 max-w-md py-24 mx-auto stretch">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input ref={inputRef} onChange={handleInputChange} />
        </div>
      </form>

      <div className="flex flex-wrap gap-1">
        {emojis.map((emoji, i) => (
          <Button key={i} size="icon" variant="ghost" onClick={() => copyToClipboard(emoji)}>
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Home
