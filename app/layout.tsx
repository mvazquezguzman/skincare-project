import type React from "react"
import type { Metadata } from "next"
import { Josefin_Sans, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner"
import "./globals.css"

/* Josefin Sans for all text */
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-josefin-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "SkinWise - Skincare App",
  description:
    "Discover skincare ingredients and build personalized skincare routines.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${josefinSans.variable} ${playfairDisplay.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <div className="pt-20">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
