"use client"

import { SparklesIcon } from "@heroicons/react/24/outline"
import { User } from "@/contexts/AuthContext"

interface WelcomeMessageProps {
  user: User | null
}

export function WelcomeMessage({ user }: WelcomeMessageProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <SparklesIcon className="h-16 w-16 text-primary" />
      </div>
      <h1 className="font-montserrat font-black text-4xl md:text-6xl text-foreground mb-6 text-balance">
        Welcome back, <span className="text-primary">{user?.firstName}</span>!
      </h1>
      <p className="font-open-sans text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
        Continue your skincare journey with personalized recommendations and track your progress.
      </p>
    </div>
  )
}
