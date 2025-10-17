import type React from "react"
import type { Metadata } from "next"
import { Josefin_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import "./globals.css"

/* Josefin Sans for all text */
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-josefin-sans",
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`font-sans ${josefinSans.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
