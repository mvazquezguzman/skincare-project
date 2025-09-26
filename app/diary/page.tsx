"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import {
  CalendarIcon,
  PlusIcon,
  ChartBarIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import { format } from "date-fns"

interface DiaryEntry {
  id: string
  date: Date
  skinCondition: {
    overall: number
    hydration: number
    texture: number
    breakouts: number
  }
  productsUsed: string[]
  notes: string
  photos?: string[]
  mood: "great" | "good" | "okay" | "poor"
  reactions?: string[]
}

interface Product {
  id: string
  name: string
  category: string
  ingredient: string
}

const mockProducts: Product[] = [
  { id: "1", name: "Gentle Cleanser", category: "Cleanser", ingredient: "Ceramides" },
  { id: "2", name: "Vitamin C Serum", category: "Serum", ingredient: "Vitamin C" },
  { id: "3", name: "Niacinamide Treatment", category: "Treatment", ingredient: "Niacinamide" },
  { id: "4", name: "Hyaluronic Acid Serum", category: "Serum", ingredient: "Hyaluronic Acid" },
  { id: "5", name: "Retinol Cream", category: "Treatment", ingredient: "Retinol" },
  { id: "6", name: "Moisturizer", category: "Moisturizer", ingredient: "Ceramides" },
  { id: "7", name: "Sunscreen SPF 50", category: "Sun Protection", ingredient: "Zinc Oxide" },
]

const mockEntries: DiaryEntry[] = [
  {
    id: "1",
    date: new Date(2024, 11, 1),
    skinCondition: { overall: 4, hydration: 3, texture: 4, breakouts: 5 },
    productsUsed: ["Gentle Cleanser", "Vitamin C Serum", "Moisturizer", "Sunscreen SPF 50"],
    notes: "Skin feeling good today. No new breakouts and the vitamin C seems to be brightening my complexion.",
    mood: "good",
  },
  {
    id: "2",
    date: new Date(2024, 10, 30),
    skinCondition: { overall: 3, hydration: 2, texture: 3, breakouts: 4 },
    productsUsed: ["Gentle Cleanser", "Niacinamide Treatment", "Hyaluronic Acid Serum", "Moisturizer"],
    notes: "Skin felt a bit dry today. Added extra hydrating serum to evening routine.",
    mood: "okay",
    reactions: ["Slight dryness"],
  },
]

export default function DiaryPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [entries, setEntries] = useState<DiaryEntry[]>(mockEntries)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<DiaryEntry>>({
    date: new Date(),
    skinCondition: { overall: 3, hydration: 3, texture: 3, breakouts: 3 },
    productsUsed: [],
    notes: "",
    mood: "okay",
  })

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
              You need to be logged in to view your skincare diary.
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

  const getTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    return entries.find((entry) => format(entry.date, "yyyy-MM-dd") === today)
  }

  const getSelectedDateEntry = () => {
    const selected = format(selectedDate, "yyyy-MM-dd")
    return entries.find((entry) => format(entry.date, "yyyy-MM-dd") === selected)
  }

  const addEntry = () => {
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: newEntry.date || new Date(),
      skinCondition: newEntry.skinCondition || { overall: 3, hydration: 3, texture: 3, breakouts: 3 },
      productsUsed: newEntry.productsUsed || [],
      notes: newEntry.notes || "",
      mood: newEntry.mood || "okay",
    }
    setEntries([entry, ...entries])
    setNewEntry({
      date: new Date(),
      skinCondition: { overall: 3, hydration: 3, texture: 3, breakouts: 3 },
      productsUsed: [],
      notes: "",
      mood: "okay",
    })
    setShowAddEntry(false)
  }

  const toggleProduct = (productName: string) => {
    const current = newEntry.productsUsed || []
    const updated = current.includes(productName) ? current.filter((p) => p !== productName) : [...current, productName]
    setNewEntry({ ...newEntry, productsUsed: updated })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "great":
        return <FaceSmileIcon className="h-5 w-5 text-green-600" />
      case "good":
        return <FaceSmileIcon className="h-5 w-5 text-blue-600" />
      case "okay":
        return <div className="h-5 w-5 bg-yellow-600 rounded-full" />
      case "poor":
        return <FaceFrownIcon className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />
    }
  }

  const getAverageRating = () => {
    if (entries.length === 0) return 0
    const sum = entries.reduce((acc, entry) => acc + entry.skinCondition.overall, 0)
    return (sum / entries.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">Skincare Diary</h1>
            <p className="font-open-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your skincare journey, monitor progress, and identify what works best for your skin
            </p>
          </div>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today" className="font-open-sans">
                Today's Entry
              </TabsTrigger>
              <TabsTrigger value="calendar" className="font-open-sans">
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="progress" className="font-open-sans">
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {getTodayEntry() ? (
                    <Card className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="font-montserrat font-bold text-xl text-foreground">
                            Today's Entry
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getMoodIcon(getTodayEntry()!.mood)}
                            <span className="font-open-sans text-sm text-muted-foreground">
                              {getTodayEntry()!.mood}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="font-open-sans text-sm text-muted-foreground">Overall</div>
                            <div
                              className={`font-montserrat font-bold text-2xl ${getRatingColor(getTodayEntry()!.skinCondition.overall)}`}
                            >
                              {getTodayEntry()!.skinCondition.overall}/5
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-open-sans text-sm text-muted-foreground">Hydration</div>
                            <div
                              className={`font-montserrat font-bold text-2xl ${getRatingColor(getTodayEntry()!.skinCondition.hydration)}`}
                            >
                              {getTodayEntry()!.skinCondition.hydration}/5
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-open-sans text-sm text-muted-foreground">Texture</div>
                            <div
                              className={`font-montserrat font-bold text-2xl ${getRatingColor(getTodayEntry()!.skinCondition.texture)}`}
                            >
                              {getTodayEntry()!.skinCondition.texture}/5
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-open-sans text-sm text-muted-foreground">Breakouts</div>
                            <div
                              className={`font-montserrat font-bold text-2xl ${getRatingColor(getTodayEntry()!.skinCondition.breakouts)}`}
                            >
                              {getTodayEntry()!.skinCondition.breakouts}/5
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Products Used</h4>
                          <div className="flex flex-wrap gap-2">
                            {getTodayEntry()!.productsUsed.map((product) => (
                              <Badge key={product} variant="secondary" className="font-open-sans">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Notes</h4>
                          <p className="font-open-sans text-muted-foreground leading-relaxed">
                            {getTodayEntry()!.notes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-border border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">No entry for today</h3>
                        <p className="font-open-sans text-muted-foreground text-center mb-4">
                          Start tracking your skincare journey by adding today's entry
                        </p>
                        <Button onClick={() => setShowAddEntry(true)} className="font-open-sans">
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Add Today's Entry
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {showAddEntry && (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="font-montserrat font-bold text-xl text-foreground">
                          Add New Entry
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-3">
                            Rate Your Skin Today
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["overall", "hydration", "texture", "breakouts"].map((aspect) => (
                              <div key={aspect} className="space-y-2">
                                <label className="font-open-sans text-sm text-muted-foreground capitalize">
                                  {aspect}
                                </label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                      key={rating}
                                      onClick={() =>
                                        setNewEntry({
                                          ...newEntry,
                                          skinCondition: {
                                            ...newEntry.skinCondition!,
                                            [aspect]: rating,
                                          },
                                        })
                                      }
                                      className={`w-6 h-6 rounded-full border-2 ${
                                        (newEntry.skinCondition?.[aspect as keyof typeof newEntry.skinCondition] ?? 0) >=
                                        rating
                                          ? "bg-primary border-primary"
                                          : "border-muted-foreground"
                                      }`}
                                    >
                                      <span className="sr-only">{rating} stars</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-3">Products Used</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {mockProducts.map((product) => (
                              <Button
                                key={product.id}
                                variant={newEntry.productsUsed?.includes(product.name) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleProduct(product.name)}
                                className="font-open-sans justify-start"
                              >
                                {newEntry.productsUsed?.includes(product.name) && (
                                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                                )}
                                {product.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-3">How do you feel?</h4>
                          <div className="flex gap-2">
                            {[
                              { value: "great", label: "Great", icon: FaceSmileIcon, color: "text-green-600" },
                              { value: "good", label: "Good", icon: FaceSmileIcon, color: "text-blue-600" },
                              { value: "okay", label: "Okay", icon: ClockIcon, color: "text-yellow-600" },
                              { value: "poor", label: "Poor", icon: FaceFrownIcon, color: "text-red-600" },
                            ].map((mood) => (
                              <Button
                                key={mood.value}
                                variant={newEntry.mood === mood.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNewEntry({ ...newEntry, mood: mood.value as any })}
                                className="font-open-sans"
                              >
                                <mood.icon className={`mr-2 h-4 w-4 ${mood.color}`} />
                                {mood.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-3">Notes</h4>
                          <Textarea
                            placeholder="How did your skin feel today? Any reactions or improvements?"
                            value={newEntry.notes}
                            onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                            className="font-open-sans"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={addEntry} className="font-open-sans">
                            <CheckCircleIcon className="mr-2 h-4 w-4" />
                            Save Entry
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddEntry(false)}
                            className="font-open-sans bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="font-montserrat font-bold text-lg text-foreground">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="font-open-sans text-sm text-muted-foreground">Average Rating</div>
                        <div className="font-montserrat font-black text-3xl text-primary">{getAverageRating()}/5</div>
                      </div>
                      <div className="text-center">
                        <div className="font-open-sans text-sm text-muted-foreground">Total Entries</div>
                        <div className="font-montserrat font-black text-2xl text-foreground">{entries.length}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-open-sans text-sm text-muted-foreground">Streak</div>
                        <div className="font-montserrat font-black text-2xl text-secondary">2 days</div>
                      </div>
                    </CardContent>
                  </Card>

                  {!getTodayEntry() && !showAddEntry && (
                    <Button onClick={() => setShowAddEntry(true)} className="w-full font-open-sans">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Today's Entry
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-montserrat font-bold text-lg text-foreground">Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {getSelectedDateEntry() ? (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="font-montserrat font-bold text-lg text-foreground">
                          {format(selectedDate, "MMMM d, yyyy")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="font-open-sans text-sm text-muted-foreground">Overall</div>
                            <div
                              className={`font-montserrat font-bold text-xl ${getRatingColor(getSelectedDateEntry()!.skinCondition.overall)}`}
                            >
                              {getSelectedDateEntry()!.skinCondition.overall}/5
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            {getMoodIcon(getSelectedDateEntry()!.mood)}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Products Used</h4>
                          <div className="flex flex-wrap gap-1">
                            {getSelectedDateEntry()!.productsUsed.map((product) => (
                              <Badge key={product} variant="secondary" className="font-open-sans text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Notes</h4>
                          <p className="font-open-sans text-sm text-muted-foreground leading-relaxed">
                            {getSelectedDateEntry()!.notes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-border border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="font-open-sans text-muted-foreground text-center">
                          No entry for {format(selectedDate, "MMMM d, yyyy")}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-montserrat font-bold text-lg text-foreground flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-primary" />
                      Skin Condition Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between">
                          <span className="font-open-sans text-sm text-muted-foreground">
                            {format(entry.date, "MMM d")}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(entry.skinCondition.overall / 5) * 100}%` }}
                              />
                            </div>
                            <span className="font-montserrat font-bold text-sm w-8">
                              {entry.skinCondition.overall}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-montserrat font-bold text-lg text-foreground">Recent Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-shrink-0">{getMoodIcon(entry.mood)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-open-sans text-sm font-medium text-foreground">
                              {format(entry.date, "MMM d, yyyy")}
                            </div>
                            <p className="font-open-sans text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
