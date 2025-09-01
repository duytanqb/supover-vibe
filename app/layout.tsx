import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supover - Leading Print-on-Demand Fulfillment | Supover.com",
  description: "Supover offers premium POD fulfillment services. 5+ years experience, 3M+ orders shipped, serving TikTok, Amazon, Google & Pinterest sellers globally.",
  keywords: "print on demand, POD fulfillment, Dragon Media, Supover, TikTok Shop, Amazon FBA, dropshipping, custom printing",
  openGraph: {
    title: "Supover - Leading Print-on-Demand Fulfillment",
    description: "Premium POD services with 3M+ orders shipped worldwide",
    url: "https://supover.com",
    siteName: "Supover",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}