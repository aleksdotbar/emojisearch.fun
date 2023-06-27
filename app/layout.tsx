import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Emojisearch",
  description: "AI-powered emoji search",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
