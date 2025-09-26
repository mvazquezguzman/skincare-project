import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "@/components/SessionProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

/* Added Montserrat for headings and Open Sans for body text per design brief */
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "SkinWise - Skincare Ingredients Library",
  description:
    "Discover safe skincare ingredients and build personalized routines with our comprehensive ingredient library and compatibility checker.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${montserrat.variable} ${openSans.variable} antialiased`}>
        <SessionProvider>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
