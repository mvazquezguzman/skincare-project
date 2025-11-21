"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
      // Wait a moment for state to update before redirecting
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if logout fails
      router.push("/")
      router.refresh()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo>
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center hover:opacity-80 transition-opacity">
            <span className="font-playfair font-black text-3xl text-primary-foreground tracking-tight">
              SkinWise
            </span>
          </Link>
        </NavbarLogo>

        <NavItems>
          {isAuthenticated && (
            <>
              <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                <Link href="/user-profile">Profile</Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                <Link href="/user-diary">Diary</Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                <Link href="/skin-routine">Routine</Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                <Link href="/skincare-products">Products</Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80">
                <Link href="/ingredient-search">Ingredients</Link>
              </Button>
            </>
          )}
        </NavItems>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div 
              className="relative" 
              ref={userDropdownRef}
            >
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors font-sans text-base flex items-center space-x-1 px-3 py-2 rounded-md"
              >
                <span>Hi, {user?.firstName || user?.email}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border shadow-lg rounded-md z-[100] overflow-hidden">
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsUserDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                asChild
                variant="ghost"
                size="default"
                className="font-sans text-base text-primary-foreground hover:text-primary-foreground/80"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="default"
                className="font-sans text-base text-primary-foreground hover:bg-[#658751] hover:text-white"
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo>
            <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center hover:opacity-80 transition-opacity">
              <span className="font-playfair font-black text-3xl text-primary-foreground tracking-tight">
                SkinWise
              </span>
            </Link>
          </NavbarLogo>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col px-4 py-6 space-y-4 overflow-y-auto">
            {isAuthenticated && (
              <>
                <Link
                  href="/user-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 font-sans text-base py-2"
                >
                  Profile
                </Link>
                <Link
                  href="/user-diary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 font-sans text-base py-2"
                >
                  Diary
                </Link>
                <Link
                  href="/skin-routine"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 font-sans text-base py-2"
                >
                  Routine
                </Link>
                <Link
                  href="/skincare-products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 font-sans text-base py-2"
                >
                  Products
                </Link>
                <Link
                  href="/ingredient-search"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 font-sans text-base py-2"
                >
                  Ingredients
                </Link>
              </>
            )}
            <div className="flex flex-col gap-4 pt-4 border-t border-primary-foreground/20">
              {isAuthenticated ? (
                <>
                  <div className="text-primary-foreground font-sans text-sm py-2">
                    Hi, {user?.firstName || user?.email}
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="font-sans text-base w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="default"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-sans text-base w-full text-primary-foreground hover:text-primary-foreground/80"
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="default"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-sans text-base w-full text-primary-foreground hover:bg-[#658751] hover:text-white"
                  >
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  )
}
