"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/AuthContext"
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
  Trash2
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
  skinType: "normal" | "dry" | "oily" | "combination" | "sensitive"
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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newStep, setNewStep] = useState<Partial<RoutineStep>>({})

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)
  }, [])

  const addRoutineStep = (timeOfDay: "morning" | "evening", step: Omit<RoutineStep, "id">): void => {
    const profile = getUserProfile()
    if (!profile) return

    const newStep: RoutineStep = {
      ...step,
      id: `${timeOfDay}-${Date.now()}`,
    }

    profile.currentRoutine[timeOfDay].push(newStep)
    localStorage.setItem("skinwise-profile", JSON.stringify(profile))
    setProfile(profile)
  }

  const removeRoutineStep = (timeOfDay: "morning" | "evening", stepId: string): void => {
    const profile = getUserProfile()
    if (!profile) return

    profile.currentRoutine[timeOfDay] = profile.currentRoutine[timeOfDay].filter((step) => step.id !== stepId)
    localStorage.setItem("skinwise-profile", JSON.stringify(profile))
    setProfile(profile)
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

  // Redirect to login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
        <Navigation />
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
                <Link href="/auth/login">Sign In</Link>
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
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
              <Link href="/profile">Complete Your Profile First</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* User Profile Header - Similar to Breakout */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-montserrat font-black text-3xl text-foreground">{profile.name}</h1>
              <p className="font-open-sans text-muted-foreground">My Routine</p>
            </div>
          </div>
          
          {/* Skin Info - Similar to Breakout's "My Skin" section */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h2 className="font-montserrat font-bold text-xl mb-4">My Skin</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profile.skinType} skin
                </Badge>
                {profile.skinConcerns.map((concern) => (
                  <Badge key={concern} variant="outline">
                    {concern}
                  </Badge>
                ))}
              </div>
              {profile.skinGoals.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skinGoals.map((goal) => (
                      <Badge key={goal} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Routine Tabs */}
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="morning" className="font-open-sans flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Morning Routine
            </TabsTrigger>
            <TabsTrigger value="evening" className="font-open-sans flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Evening Routine
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