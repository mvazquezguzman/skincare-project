"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your home page.</p>
      </div>
    )
  }

  const userName = user.firstName || user.email?.split("@")[0] || "User"
  const quickLinks = [
    {
      title: "Skincare Products",
      description: "Explore skincare products and find the best ones for your skin",
      href: "/skincare-products",
    },
    {
      title: "Ingredient Search",
      description: "Look up any ingredient&rsquo;s benefits and cautions",
      href: "/ingredient-search",
    },
    {
      title: "Ingredient Chart",
      description: "Visualize ingredient compatibility across your current routine",
      href: "/ingredient-chart",
    },
    {
      title: "Educational Hub",
      description: "Learn about skincare, tips, and science-backed guidance",
      href: "/educational-hub",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12">
            
          </div>

          {/* Main Content Area - Centered */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 md:space-y-8 px-4">
            {/* Headline */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="font-sans font-bold text-4xl md:text-6xl text-foreground">Welcome Back, {userName}</h1>
              
              {/* Subtext */}
              <p className="font-sans text-base md:text-lg lg:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                Your skin deserves more than just care—it deserves transformation. <br />
                Discover personalized skincare designed for your skin&rsquo;s unique needs.
              </p>
            </div>
          </div>

          {/* New Section */}
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4">
            {/* Left Side - Content */}
            <div className="flex flex-col text-left space-y-8">
              {/* Main Headline */}
              <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Your skin has a story. We help you rewrite it.</h2>

              {/* Separator Line */}
              <div className="w-full max-w-2xl border-t border-border"></div>

              {/* Bullet Points */}
              <ul className="space-y-4">
                <li className="font-sans text-base md:text-lg text-foreground">
                  • Struggling with dullness, acne, or early aging?
                </li>
                <li className="font-sans text-base md:text-lg text-foreground">
                  • Tired of generic skincare that doesn&rsquo;t deliver?
                </li>
                <li className="font-sans text-base md:text-lg text-foreground">
                  • Confused by endless skincare choices?
                </li>
                <li className="font-sans text-base md:text-lg text-foreground">
                  • Want results without the irritation?
                </li>
              </ul>

              {/* Separator Line */}
              <div className="w-full max-w-2xl border-t border-border"></div>

              {/* CTA Button */}
              <Link href="/skin-quiz">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="font-sans text-sm md:text-base px-6 py-4 rounded-md font-semibold uppercase tracking-wide group"
                >
                  Take Our 30-Second Skin Quiz
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Right Side - Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                  <Card className="h-full p-5 border-border/70 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-lg font-semibold text-foreground">{link.title}</h3>
                        <ArrowRightIcon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed">{link.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
