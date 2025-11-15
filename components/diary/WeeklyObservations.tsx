"use client"

import { DiaryEntry } from "@/lib/diary-types"
import { format, startOfWeek, endOfWeek, isSameWeek, parseISO } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, HeartIcon } from "@heroicons/react/24/outline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WeeklyObservationsProps {
  entries: DiaryEntry[]
}

interface WeekGroup {
  weekStart: Date
  weekEnd: Date
  entries: DiaryEntry[]
}

const getSkinFeelLabel = (skinFeel: string): string => {
  const labels: Record<string, string> = {
    dry: "Dry",
    oily: "Oily",
    balanced: "Balanced",
    sensitive: "Sensitive",
    irritated: "Irritated",
    combination: "Combination",
    normal: "Normal",
    acne: "Acne",
  }
  return labels[skinFeel] || skinFeel
}


export function WeeklyObservations({ entries }: WeeklyObservationsProps) {
  // Group entries by week
  const groupEntriesByWeek = (): WeekGroup[] => {
    const weekGroups: WeekGroup[] = []
    const processedEntries = new Set<string>()

    // Sort entries by date (newest first)
    const sortedEntries = [...entries]
      .filter((entry) => entry.image_url) // Only show entries with images
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())

    sortedEntries.forEach((entry) => {
      if (processedEntries.has(entry.id)) return

      const entryDate = parseISO(entry.entry_date)
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(entryDate, { weekStartsOn: 1 })

      // Find or create week group
      let weekGroup = weekGroups.find(
        (wg) => isSameWeek(wg.weekStart, weekStart, { weekStartsOn: 1 })
      )

      if (!weekGroup) {
        weekGroup = {
          weekStart,
          weekEnd,
          entries: [],
        }
        weekGroups.push(weekGroup)
      }

      // Add entry to week group (only one entry per week, take the first one with image)
      if (weekGroup.entries.length === 0) {
        weekGroup.entries.push(entry)
        processedEntries.add(entry.id)
      }
    })

    return weekGroups.sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    )
  }

  const weekGroups = groupEntriesByWeek()

  // Filter by month
  const getCurrentMonthEntries = (): WeekGroup[] => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return weekGroups.filter((wg) => {
      const weekMonth = wg.weekStart.getMonth()
      const weekYear = wg.weekStart.getFullYear()
      return weekMonth === currentMonth && weekYear === currentYear
    })
  }

  const currentMonthEntries = getCurrentMonthEntries()

  if (weekGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-open-sans">No weekly observations with photos yet. Upload photos in your diary entries to see them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="font-open-sans flex items-center gap-2">
            <HeartIcon className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="month" className="font-open-sans flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            This Month
          </TabsTrigger>
          <TabsTrigger value="by-month" className="font-open-sans flex items-center gap-2">
            <HeartIcon className="h-4 w-4" />
            By Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weekGroups.map((weekGroup, index) => {
              const entry = weekGroup.entries[0]
              if (!entry) return null

              const monthName = format(weekGroup.weekStart, "MMM")
              // Calculate week number within the month
              const firstDayOfMonth = new Date(weekGroup.weekStart.getFullYear(), weekGroup.weekStart.getMonth(), 1)
              const firstWeekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
              const weekNumber = Math.floor(
                (weekGroup.weekStart.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
              ) + 1

              return (
                <Card key={`${weekGroup.weekStart.toISOString()}-${index}`} className="overflow-hidden">
                  {entry.image_url && (
                    <div className="relative w-full h-48 bg-muted">
                      <img
                        src={entry.image_url}
                        alt={`Week ${weekNumber} observation`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-open-sans">
                        {monthName}: Week {weekNumber}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-open-sans">
                      {format(weekGroup.weekStart, "MMMM d, yyyy")} – {format(weekGroup.weekEnd, "MMMM d, yyyy")}
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="text-xs font-semibold text-blue-500 font-open-sans uppercase tracking-wide">
                        SKIN OBSERVATION
                      </div>
                      <div className="space-y-1 text-sm font-open-sans">
                        <div>
                          <span className="font-semibold">SKIN TEXTURE:</span>{" "}
                          <span>{getSkinFeelLabel(entry.skin_feel)}</span>
                        </div>
                        <div>
                          <span className="font-semibold">RATING:</span>{" "}
                          <span>{entry.skin_condition_rating}/5</span>
                        </div>
                        {entry.notes && (
                          <div className="pt-1">
                            <span className="font-semibold">NOTES:</span>{" "}
                            <span className="text-muted-foreground">{entry.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentMonthEntries.map((weekGroup, index) => {
              const entry = weekGroup.entries[0]
              if (!entry) return null

              const monthName = format(weekGroup.weekStart, "MMM")
              // Calculate week number within the month
              const firstDayOfMonth = new Date(weekGroup.weekStart.getFullYear(), weekGroup.weekStart.getMonth(), 1)
              const firstWeekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
              const weekNumber = Math.floor(
                (weekGroup.weekStart.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
              ) + 1

              return (
                <Card key={`${weekGroup.weekStart.toISOString()}-${index}`} className="overflow-hidden">
                  {entry.image_url && (
                    <div className="relative w-full h-48 bg-muted">
                      <img
                        src={entry.image_url}
                        alt={`Week ${weekNumber} observation`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-open-sans">
                        {monthName}: Week {weekNumber}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-open-sans">
                      {format(weekGroup.weekStart, "MMMM d, yyyy")} – {format(weekGroup.weekEnd, "MMMM d, yyyy")}
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="text-xs font-semibold text-blue-500 font-open-sans uppercase tracking-wide">
                        SKIN OBSERVATION
                      </div>
                      <div className="space-y-1 text-sm font-open-sans">
                        <div>
                          <span className="font-semibold">SKIN TEXTURE:</span>{" "}
                          <span>{getSkinFeelLabel(entry.skin_feel)}</span>
                        </div>
                        <div>
                          <span className="font-semibold">RATING:</span>{" "}
                          <span>{entry.skin_condition_rating}/5</span>
                        </div>
                        {entry.notes && (
                          <div className="pt-1">
                            <span className="font-semibold">NOTES:</span>{" "}
                            <span className="text-muted-foreground">{entry.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-month" className="mt-6">
          <div className="space-y-8">
            {Object.entries(
              weekGroups.reduce((acc, weekGroup) => {
                const monthKey = format(weekGroup.weekStart, "MMMM yyyy")
                if (!acc[monthKey]) {
                  acc[monthKey] = []
                }
                acc[monthKey].push(weekGroup)
                return acc
              }, {} as Record<string, WeekGroup[]>)
            )
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([monthKey, groups]) => (
                <div key={monthKey} className="space-y-4">
                  <h3 className="font-montserrat text-xl font-semibold">{monthKey}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groups.map((weekGroup, index) => {
                      const entry = weekGroup.entries[0]
                      if (!entry) return null

                      const monthName = format(weekGroup.weekStart, "MMM")
                      // Calculate week number within the month
                      const firstDayOfMonth = new Date(weekGroup.weekStart.getFullYear(), weekGroup.weekStart.getMonth(), 1)
                      const firstWeekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
                      const weekNumber = Math.floor(
                        (weekGroup.weekStart.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
                      ) + 1

                      return (
                        <Card key={`${weekGroup.weekStart.toISOString()}-${index}`} className="overflow-hidden">
                          {entry.image_url && (
                            <div className="relative w-full h-48 bg-muted">
                              <img
                                src={entry.image_url}
                                alt={`Week ${weekNumber} observation`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4" />
                              <span className="font-open-sans">
                                {monthName}: Week {weekNumber}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-open-sans">
                              {format(weekGroup.weekStart, "MMMM d, yyyy")} – {format(weekGroup.weekEnd, "MMMM d, yyyy")}
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                              <div className="text-xs font-semibold text-blue-500 font-open-sans uppercase tracking-wide">
                                SKIN OBSERVATION
                              </div>
                              <div className="space-y-1 text-sm font-open-sans">
                                <div>
                                  <span className="font-semibold">SKIN TEXTURE:</span>{" "}
                                  <span>{getSkinFeelLabel(entry.skin_feel)}</span>
                                </div>
                                <div>
                                  <span className="font-semibold">RATING:</span>{" "}
                                  <span>{entry.skin_condition_rating}/5</span>
                                </div>
                                {entry.concerns_noted && entry.concerns_noted.length > 0 && (
                                  <div>
                                    <span className="font-semibold">CONCERNS:</span>{" "}
                                    <span>{entry.concerns_noted.join(", ")}</span>
                                  </div>
                                )}
                                {entry.notes && (
                                  <div className="pt-1">
                                    <span className="font-semibold">NOTES:</span>{" "}
                                    <span className="text-muted-foreground">{entry.notes}</span>
                                  </div>
                                )}
                                {entry.products_used && entry.products_used.length > 0 && (
                                  <div>
                                    <span className="font-semibold">PRODUCTS:</span>{" "}
                                    <span className="text-muted-foreground">{entry.products_used.join(", ")}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

