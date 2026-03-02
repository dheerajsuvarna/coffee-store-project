import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
  <body suppressHydrationWarning>
    <main className="relative">{props.children}</main>
  </body>
</html>
  )
}
