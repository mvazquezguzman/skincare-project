"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User } from "@/contexts/AuthContext"
import { PlusIcon } from "@heroicons/react/24/outline"

interface UserCardProps {
  user: User | null
  skinConcerns?: string[]
  routineItems?: number
}

export function UserCard({ user, skinConcerns = [], routineItems = 0 }: UserCardProps) {
  const defaultSkinConcerns = ["Dry", "Acne", "Pigmentation", "Dryness"]
  const displayConcerns = skinConcerns.length > 0 ? skinConcerns : defaultSkinConcerns

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.firstName} />
            <AvatarFallback className="text-lg font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-montserrat font-bold text-xl text-foreground">
              @{user?.firstName?.toLowerCase() || "user"}
            </h2>
          </div>
        </div>
        <Button className="bg-black text-white hover:bg-black/90 rounded-lg px-6 py-2">
          <PlusIcon className="h-4 w-4 mr-2" />
          Follow
        </Button>
      </div>

      {/* Skin Concerns */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {displayConcerns.map((concern, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-black text-black hover:bg-gray-50 px-4 py-2 rounded-full"
            >
              {concern}
            </Badge>
          ))}
        </div>
      </div>

      {/* Current Routine Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat font-bold text-lg text-foreground">
            My current routine
          </h3>
          <span className="text-sm text-muted-foreground">
            {routineItems} items
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Placeholder product images */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="flex items-center text-sm text-foreground hover:text-primary cursor-pointer">
          <span>View all</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
