"use client"

import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "@heroicons/react/24/outline"

export default function DiaryPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-open-sans text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="font-montserrat font-bold text-2xl text-foreground mb-4">Access Denied</h1>
            <p className="font-open-sans text-muted-foreground mb-6">You need to be logged in to view your skincare diary.</p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
          </div>
          
          <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground mb-4">Coming Soon</h1>          
        </div>
      </main>
    </div>
  )
}
