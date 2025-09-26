"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BeakerIcon,
  CalendarIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()


  const navItems = [
    { href: "/ingredient-search", label: "Ingredient Search", icon: MagnifyingGlassIcon },
    { href: "/ingredient-chart", label: "Ingredient Chart", icon: ShieldCheckIcon },
    { href: "/learn", label: "Learn", icon: AcademicCapIcon },
  ]

  return (
    <nav className="bg-primary text-primary-foreground border-b-0 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BeakerIcon className="h-8 w-8 text-secondary" />
            <span className="font-montserrat font-black text-xl text-primary-foreground">SkinWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span className="font-open-sans">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-1 text-primary-foreground hover:bg-primary-foreground/10 px-3 py-2 rounded-md transition-colors"
                  >
                    <span className="font-open-sans text-sm">
                      Hi, {user?.firstName || 'User'}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" sideOffset={5}>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <UserCircleIcon className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/routine-builder" className="flex items-center w-full">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Routine Builder
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/diary" className="flex items-center w-full">
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      Skincare Diary
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-primary-foreground/60 text-sm font-open-sans">
                Not logged in
              </span>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-open-sans">{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-border">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      Logged in as: {user?.firstName || 'User'}
                    </div>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 py-2">
                      <UserCircleIcon className="h-5 w-5" />
                      <span className="font-open-sans">Profile</span>
                    </Link>
                    <Link href="/routine-builder" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 py-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="font-open-sans">Routine Builder</span>
                    </Link>
                    <Link href="/diary" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 py-2">
                      <BookOpenIcon className="h-5 w-5" />
                      <span className="font-open-sans">Skincare Diary</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Not logged in
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
