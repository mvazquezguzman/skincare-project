"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiaryCalendar } from "@/components/diary/DiaryCalendar"
import { DiaryEntryForm } from "@/components/diary/DiaryEntryForm"
import { DiaryEntriesTable } from "@/components/diary/DiaryEntriesTable"
import { DiaryEntryModal } from "@/components/diary/DiaryEntryModal"
import { WeeklyObservations } from "@/components/diary/WeeklyObservations"
import {
  getDiaryEntries,
  getDiaryEntryByDate,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "@/lib/diary-service"
import { DiaryEntry, DiaryEntryFormData } from "@/lib/diary-types"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { toast } from "sonner"
import { HeartIcon } from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DiaryPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeView, setActiveView] = useState<"month" | "week" | "all">("month")

  // Load all entries
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllEntries()
    }
  }, [isAuthenticated, user])

  // Load entry for selected date (only if not in new entry mode)
  useEffect(() => {
    if (selectedDate && isAuthenticated && user && !isFormDialogOpen) {
      loadEntryForDate(selectedDate)
    }
  }, [selectedDate, isAuthenticated, user, isFormDialogOpen])

  const loadAllEntries = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await getDiaryEntries(user.id)
      setAllEntries(data)
    } catch (error) {
      console.error("Error loading entries:", error)
      toast.error("Failed to load diary entries")
    } finally {
      setIsLoading(false)
    }
  }

  const loadEntryForDate = async (date: Date) => {
    if (!user) return

    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const entry = await getDiaryEntryByDate(user.id, dateStr)
      setSelectedEntry(entry)
      setIsEditMode(!!entry)
    } catch (error) {
      console.error("Error loading entry:", error)
    }
  }

  const getFilteredEntries = (): DiaryEntry[] => {
    const now = new Date()
    
    switch (activeView) {
      case "week":
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        return allEntries.filter((entry) => {
          const entryDate = new Date(entry.entry_date)
          return isWithinInterval(entryDate, { start: weekStart, end: weekEnd })
        })
      case "month":
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        return allEntries.filter((entry) => {
          const entryDate = new Date(entry.entry_date)
          return isWithinInterval(entryDate, { start: monthStart, end: monthEnd })
        })
      case "all":
        return allEntries
      default:
        return allEntries
    }
  }

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return
    
    setSelectedDate(date)
    setIsFormDialogOpen(true)
    
    // Check if entry exists for this date
    if (user) {
      try {
        const dateStr = format(date, "yyyy-MM-dd")
        const entry = await getDiaryEntryByDate(user.id, dateStr)
        setSelectedEntry(entry)
        setIsEditMode(!!entry)
      } catch (error) {
        console.error("Error loading entry:", error)
        setSelectedEntry(null)
        setIsEditMode(false)
      }
    }
  }

  const handleFormSubmit = async (formData: DiaryEntryFormData) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      if (selectedEntry && isEditMode) {
        const updated = await updateDiaryEntry(selectedEntry.id, formData)
        setAllEntries((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        )
        setSelectedEntry(updated)
        toast.success("Entry updated successfully!")
      } else {
        const newEntry = await createDiaryEntry(user.id, formData)
        setAllEntries((prev) => [newEntry, ...prev])
        setSelectedEntry(newEntry)
        setIsEditMode(true)
        toast.success("Entry saved successfully!")
      }
      setIsFormDialogOpen(false)
      setSelectedDate(undefined)

      await loadAllEntries()
    } catch (error: any) {
      console.error("Error saving entry:", error)
      toast.error(error.message || "Failed to save entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    try {
      await deleteDiaryEntry(entryId)
      setAllEntries((prev) => prev.filter((e) => e.id !== entryId))
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null)
        setIsEditMode(false)
      }
      toast.success("Entry deleted successfully!")
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast.error("Failed to delete entry. Please try again.")
    }
  }

  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry)
    setIsModalOpen(true)
  }

  const handleEditFromModal = () => {
    setIsModalOpen(false)
    setIsEditMode(true)
    if (selectedEntry) {
      setSelectedDate(new Date(selectedEntry.entry_date))
      setIsFormDialogOpen(true)
    }
  }

  const handleNewEntry = () => {
    const today = new Date()
    setSelectedDate(today)
    setSelectedEntry(null)
    setIsEditMode(false)

    setIsFormDialogOpen(true)
  }

  if (authLoading) {
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

  const filteredEntries = getFilteredEntries()
  const formInitialData = selectedEntry
    ? {
        entry_date: selectedEntry.entry_date,
        entry_name: selectedEntry.entry_name || undefined,
        skin_feel: selectedEntry.skin_feel,
        skin_condition_rating: selectedEntry.skin_condition_rating,
        notes: selectedEntry.notes || undefined,
        image_url: selectedEntry.image_url || undefined,
      }
    : undefined

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground mb-2">My Skincare Diary</h1>
          <p className="font-open-sans text-muted-foreground">Track your daily skin condition and monitor your skincare journey</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-open-sans text-muted-foreground">Loading entries...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Calendar and Entries Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar - Always visible on the left */}
              <DiaryCalendar
                entries={allEntries}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
              {/* Entries table - Always visible on the right, filtered by active view */}
              <div className="space-y-4">
                {/* Navigation Tabs and New Button - Aligned on same row */}
                <div className="flex items-center justify-between gap-4">
                  <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="month" className="font-open-sans">Month</TabsTrigger>
                      <TabsTrigger value="week" className="font-open-sans">Week</TabsTrigger>
                      <TabsTrigger value="all" className="font-open-sans flex items-center gap-2"><HeartIcon className="h-4 w-4" />All</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Button onClick={handleNewEntry} className="font-open-sans">+ New</Button>
                </div>
                <DiaryEntriesTable
                  entries={filteredEntries}
                  onEntryClick={handleEntryClick}
                />
              </div>
            </div>

            {/* Weekly Observations Section */}
            <div className="space-y-4">
              <div>
                <h2 className="font-montserrat font-black text-2xl md:text-3xl text-foreground mb-2">Weekly Skin Observations</h2>
                <p className="font-open-sans text-muted-foreground">Track your skin progress with weekly photos and observations</p>
              </div>
              <WeeklyObservations entries={allEntries} />
            </div>
          </div>
        )}
      </main>

      {/* Entry View Modal */}
      <DiaryEntryModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        onEdit={handleEditFromModal}
      />

      {/* Form Dialog */}
      <Dialog 
        open={isFormDialogOpen} 
        onOpenChange={(open) => {
          setIsFormDialogOpen(open)
          if (!open) {
            setSelectedDate(undefined)
            setSelectedEntry(null)
            setIsEditMode(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedDate && (
            <DiaryEntryForm
              initialData={formInitialData}
              selectedDate={selectedDate}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              showCard={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
