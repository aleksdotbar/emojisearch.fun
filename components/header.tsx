import { ModeToggle } from "@/components/mode-toggle"

export const Header = () => {
  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <span className="text-xl">🕵️‍♂️</span>

        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
