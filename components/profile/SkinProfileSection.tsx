 "use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Camera, Trash2, User } from "lucide-react"
import { UserProfile } from "@/lib/profile-types"
import { formatBudgetRange } from "@/lib/profile-utils"
import Link from "next/link"

interface SkinProfileSectionProps {
  profile: UserProfile
  isEditingProfile: boolean
  onEditToggle: () => void
  onProfileChange: (profile: UserProfile) => void
}

function formatMakeupUsage(makeupUsage?: string): string {
  if (!makeupUsage) return ""
  
  const usageMap: Record<string, string> = {
    "none": "I don't wear makeup",
    "eyes-only": "I wear minimal makeup",
    "full-face": "I wear full face makeup"
  }
  
  return usageMap[makeupUsage] || makeupUsage
}

export default function SkinProfileSection({
  profile,
  isEditingProfile,
  onEditToggle,
  onProfileChange
}: SkinProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const updatedProfile = { ...profile, profilePicture: result }
      onProfileChange(updatedProfile)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updatedProfile = { ...profile, profilePicture: undefined }
    onProfileChange(updatedProfile)
  }

  const hasSkinProfileDetails =
    Boolean(profile.skinType) ||
    profile.skinConcerns.length > 0 ||
    profile.skinGoals.length > 0 ||
    profile.allergies.length > 0 ||
    Boolean(profile.budgetRange) ||
    Boolean(profile.makeupUsage)

  return (
    <section className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <div className="relative bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-6">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-primary" />
              )}
            </div>
            {isEditingProfile && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {profile.profilePicture && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9 rounded-full"
                    onClick={removeProfilePicture}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />

            <div className="text-center space-y-2">
              <h3 className="font-montserrat font-bold text-xl text-foreground">
                {profile.name}
              </h3>
              {profile.city && (
                <p className="text-sm text-muted-foreground">{profile.city}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button onClick={onEditToggle} variant="outline" size="sm" className="w-full">
                {isEditingProfile ? "Done Editing" : "Edit Profile"}
              </Button>
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href="/skin-quiz">Update Skin Profile</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-montserrat font-bold text-2xl text-foreground">
                My Skin Profile
              </h2>
            </div>

            {hasSkinProfileDetails ? (
              <div className="space-y-4 flex-1">
                {profile.skinConcerns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Top Concerns
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.skinConcerns.join(", ")}
                    </p>
                  </div>
                )}

                {profile.skinType && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Skin Feel
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile.skinType}
                    </p>
                  </div>
                )}

                {profile.skinGoals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Skin Goals
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.skinGoals.join(", ")}
                    </p>
                  </div>
                )}

                {profile.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Ingredient Preferences
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.allergies.join(", ")}
                    </p>
                  </div>
                )}

                {profile.budgetRange && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Budget Range
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatBudgetRange(profile.budgetRange)}
                    </p>
                  </div>
                )}

                {profile.makeupUsage && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Makeup Usage
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatMakeupUsage(profile.makeupUsage)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-10">
                <p className="text-muted-foreground">
                  Complete your skin profile to unlock personalized recommendations,
                  budget-friendly swaps, and ingredient alerts tailored to you.
                </p>
                <Button asChild>
                  <Link href="/skin-quiz">Take Skin Quiz</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
