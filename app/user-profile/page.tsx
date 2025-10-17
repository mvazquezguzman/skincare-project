"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { 
  User, 
  Heart, 
  Shield, 
  Droplets, 
  Sun, 
  Moon, 
  Clock, 
  CheckCircle,
  Plus,
  Edit3,
  Trash2,
  Camera,
  Upload
} from "lucide-react"
import Link from "next/link"

type RoutineStep = {
  id: string
  step: number
  category: "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen" | "treatment"
  productName: string
  brand?: string
  ingredients?: string[]
  frequency: "daily" | "alternate" | "weekly" | "as-needed"
  notes?: string
}

type UserProfile = {
  id: string
  name: string
  profilePicture?: string
  skinType: "normal" | "dry" | "oily" | "combination" | "sensitive" | null
  skinConcerns: string[]
  skinGoals: string[]
  allergies: string[]
  currentRoutine: {
    morning: RoutineStep[]
    evening: RoutineStep[]
  }
}

const getUserProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("skinwise-profile")
  return stored ? JSON.parse(stored) : null
}

const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("skinwise-profile", JSON.stringify(profile))
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newStep, setNewStep] = useState<Partial<RoutineStep>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug authentication state
  console.log('ProfilePage: Auth state:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user, 
    userId: user?.id 
  })

  // Add a state to track if we've given enough time for auth to load
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  useEffect(() => {
    // Give authentication time to load
    const timer = setTimeout(() => {
      setAuthCheckComplete(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) return

      try {
        // Fetch user profile from database
        const { data: dbProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        // Create profile from database data
        const userProfile: UserProfile = {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          skinType: dbProfile.skin_type as UserProfile["skinType"] || null,
          skinConcerns: dbProfile.skin_concerns ? (Array.isArray(dbProfile.skin_concerns) ? dbProfile.skin_concerns : JSON.parse(dbProfile.skin_concerns)) : [],
          skinGoals: dbProfile.skin_goals ? (Array.isArray(dbProfile.skin_goals) ? dbProfile.skin_goals : JSON.parse(dbProfile.skin_goals)) : [],
          allergies: dbProfile.allergies ? (Array.isArray(dbProfile.allergies) ? dbProfile.allergies : JSON.parse(dbProfile.allergies)) : [],
          currentRoutine: {
            morning: [],
            evening: []
          }
        }
        
        // Save to localStorage for offline access
        saveUserProfile(userProfile)
        setProfile(userProfile)
      } catch (error) {
        console.error('Error initializing profile:', error)
        // Fallback to localStorage if database fails
        const userProfile = getUserProfile()
        if (userProfile) {
          setProfile(userProfile)
        }
      }
    }

    if (isAuthenticated && user) {
      initializeProfile()
    }
  }, [user, isAuthenticated])

  const addRoutineStep = (timeOfDay: "morning" | "evening", step: Omit<RoutineStep, "id">): void => {
    const currentProfile = getUserProfile()
    if (!currentProfile) return

    const newStep: RoutineStep = {
      ...step,
      id: `${timeOfDay}-${Date.now()}`,
    }

    const updatedProfile = {
      ...currentProfile,
      currentRoutine: {
        ...currentProfile.currentRoutine,
        [timeOfDay]: [...currentProfile.currentRoutine[timeOfDay], newStep]
      }
    }

    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const removeRoutineStep = (timeOfDay: "morning" | "evening", stepId: string): void => {
    const currentProfile = getUserProfile()
    if (!currentProfile) return

    const updatedProfile = {
      ...currentProfile,
      currentRoutine: {
        ...currentProfile.currentRoutine,
        [timeOfDay]: currentProfile.currentRoutine[timeOfDay].filter((step) => step.id !== stepId)
      }
    }

    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const handleAddStep = (timeOfDay: "morning" | "evening") => {
    if (!newStep.productName || !newStep.category) return

    addRoutineStep(timeOfDay, {
      step: (profile?.currentRoutine[timeOfDay].length || 0) + 1,
      category: newStep.category as RoutineStep["category"],
      productName: newStep.productName,
      brand: newStep.brand || "",
      ingredients: newStep.ingredients || [],
      frequency: newStep.frequency || "daily",
      notes: newStep.notes,
    })

    setNewStep({})
  }

  const handleRemoveStep = (timeOfDay: "morning" | "evening", stepId: string) => {
    removeRoutineStep(timeOfDay, stepId)
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (profile) {
        const updatedProfile = { ...profile, profilePicture: result }
        saveUserProfile(updatedProfile)
        setProfile(updatedProfile)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    if (profile) {
      const updatedProfile = { ...profile, profilePicture: undefined }
      saveUserProfile(updatedProfile)
      setProfile(updatedProfile)
    }
  }


  // Show loading while authentication is being checked
  if (isLoading || !authCheckComplete) {
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

  // Check authentication after giving it time to load
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="font-montserrat font-bold text-2xl text-foreground mb-4">
              Access Denied
            </h1>
            <p className="font-open-sans text-muted-foreground mb-6">
              You need to be logged in to view your routine.
            </p>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-montserrat font-black text-4xl text-foreground mb-4">
              Create Your Skincare Routine
            </h1>
            <p className="font-open-sans text-lg text-muted-foreground mb-8">
              Start building your personalized skincare routine to achieve your skin goals.
            </p>
          </div>
          
          <Button asChild size="lg" className="font-open-sans font-medium">
            <Link href="/skin-routine">Complete Your Profile First</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Enhanced User Profile Header */}
        <div className="mb-8">
          
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              {isEditing && (
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  {profile.profilePicture && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 rounded-full"
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
            </div>
            <div className="flex-1">
              <h2 className="font-montserrat font-black text-4xl text-foreground mb-2">{profile.name}</h2>
              <p className="font-open-sans text-lg text-muted-foreground">Your Personalized Skincare Journey</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-sm">
                  {profile.skinType ? `${profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1)} Skin` : 'Profile Setup'}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="font-sans"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? "Done Editing" : "Edit Profile"}
            </Button>
          </div>
          
          {/* Enhanced Skin Info Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-8 border border-primary/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-montserrat font-bold text-2xl">My Skin Profile</h2>
            </div>
            <div className="space-y-4">
              {!profile.skinType && profile.skinConcerns.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Complete your skin profile to get personalized recommendations
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/skin-quiz">Take Skin Quiz</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* Top Concerns */}
                    {profile.skinConcerns && profile.skinConcerns.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Top Concerns: <span className="text-muted-foreground">{profile.skinConcerns.join(", ")}</span>
                        </p>
                      </div>
                    )}

                    {/* Skin Type */}
                    {profile.skinType && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Skin Feel: <span className="text-muted-foreground capitalize">{profile.skinType}</span>
                        </p>
                      </div>
                    )}

                    {/* Skin Goals */}
                    {profile.skinGoals && profile.skinGoals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Skin Goals: <span className="text-muted-foreground">{profile.skinGoals.join(", ")}</span>
                        </p>
                      </div>
                    )}

                    {/* Allergies/Preferences */}
                    {profile.allergies && profile.allergies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Ingredient Preferences: <span className="text-muted-foreground">{profile.allergies.join(", ")}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/skin-quiz">Update Skin Profile</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Morning Steps</p>
                <p className="text-2xl font-bold">{profile.currentRoutine.morning.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evening Steps</p>
                <p className="text-2xl font-bold">{profile.currentRoutine.evening.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{profile.currentRoutine.morning.length + profile.currentRoutine.evening.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Routine Tabs */}
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="morning" className="font-open-sans flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Morning Routine ({profile.currentRoutine.morning.length})
            </TabsTrigger>
            <TabsTrigger value="evening" className="font-open-sans flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Evening Routine ({profile.currentRoutine.evening.length})
            </TabsTrigger>
          </TabsList>

          {(["morning", "evening"] as const).map((timeOfDay) => (
            <TabsContent key={timeOfDay} value={timeOfDay} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-bold text-xl">
                  {timeOfDay === "morning" ? "☀️ Morning" : "🌙 Evening"} Routine
                </h3>
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant="outline" 
                  size="sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? "Done Editing" : "Edit Routine"}
                </Button>
              </div>

              {/* Routine Steps */}
              <div className="space-y-4">
                {profile.currentRoutine[timeOfDay].length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">No {timeOfDay} routine yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Start building your {timeOfDay} skincare routine by adding products.
                      </p>
                      <Button onClick={() => setIsEditing(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Step
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  profile.currentRoutine[timeOfDay].map((step, index) => (
                    <Card key={step.id} className="relative">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{step.productName}</h4>
                              {step.brand && (
                                <p className="text-sm text-muted-foreground mb-2">by {step.brand}</p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {step.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {step.frequency}
                                </Badge>
                              </div>
                              {step.notes && (
                                <p className="text-sm text-muted-foreground">{step.notes}</p>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveStep(timeOfDay, step.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Add New Step Form */}
              {isEditing && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Step</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Product Category</Label>
                        <Select
                          onValueChange={(value) =>
                            setNewStep({ ...newStep, category: value as RoutineStep["category"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cleanser">Cleanser</SelectItem>
                            <SelectItem value="toner">Toner</SelectItem>
                            <SelectItem value="serum">Serum</SelectItem>
                            <SelectItem value="moisturizer">Moisturizer</SelectItem>
                            <SelectItem value="sunscreen">Sunscreen</SelectItem>
                            <SelectItem value="treatment">Treatment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <input
                          type="text"
                          placeholder="Enter product name"
                          value={newStep.productName || ""}
                          onChange={(e) => setNewStep({ ...newStep, productName: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand (Optional)</Label>
                        <input
                          type="text"
                          placeholder="Enter brand name"
                          value={newStep.brand || ""}
                          onChange={(e) => setNewStep({ ...newStep, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                          onValueChange={(value) =>
                            setNewStep({ ...newStep, frequency: value as RoutineStep["frequency"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="alternate">Every Other Day</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as-needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <textarea
                        placeholder="Any additional notes about this product..."
                        value={newStep.notes || ""}
                        onChange={(e) => setNewStep({ ...newStep, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-md"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => handleAddStep(timeOfDay)}
                      disabled={!newStep.productName || !newStep.category}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )

}