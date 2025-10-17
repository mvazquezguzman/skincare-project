"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { SparklesIcon, UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-primary border-b border-primary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <SparklesIcon className="h-10 w-10 text-primary-foreground" />
            <span className="font-sans font-black text-3xl text-primary-foreground">
              SkinWise
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                  <Link href="/user-profile">Profile</Link>
                </Button>
                <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                  <Link href="/skin-routine">Routine</Link>
                </Button>
                <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                  <Link href="/user-diary">Diary</Link>
                </Button>
              </>
            )}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors font-sans text-base flex items-center space-x-1 px-3 py-2 rounded-md"
              >
                <span>Learn</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-[100] overflow-hidden">
                  <Link 
                    href="/educational-hub" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-t-md"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Educational Hub
                  </Link>
                  <Link 
                    href="/ingredient-chart" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Ingredient Chart
                  </Link>
                  <Link 
                    href="/ingredient-search" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-b-md"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Ingredient Search
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-base text-primary-foreground">
                  Welcome, {user?.firstName || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleLogout}
                  className="font-sans text-base"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="default" className="font-sans text-base">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild size="default" className="font-sans text-base">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
