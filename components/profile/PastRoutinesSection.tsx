"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRoutine, getRoutineHistory, setCurrentRoutine } from "@/lib/routine-service"
import { RoutineStep } from "@/lib/profile-types"
import { getCategoryDisplayName } from "@/lib/routine-utils"
import { getCategoryOrder } from "@/lib/profile-utils"
import { ChevronDown, ChevronUp, Calendar, RotateCcw } from "lucide-react"
import RoutineStepCard from "./RoutineStepCard"

interface PastRoutinesSectionProps {
  userId: string
  currentRoutineId?: string
  onRoutineRestored?: () => void
}

export default function PastRoutinesSection({
  userId,
  currentRoutineId,
  onRoutineRestored
}: PastRoutinesSectionProps) {
  const [pastRoutines, setPastRoutines] = useState<UserRoutine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)
  const [activeTabByRoutine, setActiveTabByRoutine] = useState<Record<string, "morning" | "evening">>({})
  const [isRestoring, setIsRestoring] = useState<string | null>(null)

  useEffect(() => {
    const fetchPastRoutines = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const allRoutines = await getRoutineHistory(userId)
        // Filter out the current routine
        const past = allRoutines.filter(routine => 
          !routine.is_current && routine.id !== currentRoutineId
        )
        setPastRoutines(past)
      } catch (error) {
        console.error('Error fetching past routines:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPastRoutines()
  }, [userId, currentRoutineId])

  const handleRestoreRoutine = async (routineId: string) => {
    if (!userId) return

    setIsRestoring(routineId)
    try {
      await setCurrentRoutine(routineId, userId)
      if (onRoutineRestored) {
        onRoutineRestored()
      }
      alert('Routine restored successfully!')
    } catch (error) {
      console.error('Error restoring routine:', error)
      alert('Failed to restore routine. Please try again.')
    } finally {
      setIsRestoring(null)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleRoutine = (routineId: string) => {
    setExpandedRoutineId(expandedRoutineId === routineId ? null : routineId)
    // Initialize tab for this routine if not set
    if (!activeTabByRoutine[routineId]) {
      setActiveTabByRoutine(prev => ({ ...prev, [routineId]: "morning" }))
    }
  }

  const handleTabChange = (routineId: string, tab: "morning" | "evening") => {
    setActiveTabByRoutine(prev => ({ ...prev, [routineId]: tab }))
  }

  if (isLoading) {
    return (
      <div className="mb-6">
        <h1 className="font-montserrat font-black text-3xl mb-6">MY PAST ROUTINES</h1>
        <Card className="border shadow-sm">
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">Loading past routines...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (pastRoutines.length === 0) {
    return (
      <div className="mb-6">
        <h1 className="font-montserrat font-black text-3xl mb-6">MY PAST ROUTINES</h1>
        <Card className="border shadow-sm">
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">
              No past routines yet. Your previous routines will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h1 className="font-montserrat font-black text-3xl mb-6">MY PAST ROUTINES</h1>
      
      <div className="space-y-4">
        {pastRoutines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id
          const activeTab = activeTabByRoutine[routine.id] || "morning"
          const morningSteps = routine.routine.morning || []
          const eveningSteps = routine.routine.evening || []
          const totalSteps = morningSteps.length + eveningSteps.length

          return (
            <Card key={routine.id} className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {routine.name || `Routine from ${formatDate(routine.created_at)}`}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(routine.created_at)}</span>
                      </div>
                      <span>•</span>
                      <span>{totalSteps} products</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreRoutine(routine.id)}
                      disabled={isRestoring === routine.id}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {isRestoring === routine.id ? "Restoring..." : "Restore"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRoutine(routine.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          View
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(v) => handleTabChange(routine.id, v as typeof activeTab)}>
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                      <TabsTrigger value="morning" className="flex items-center gap-2">
                        ☀️
                        AM Routine ({morningSteps.length})
                      </TabsTrigger>
                      <TabsTrigger value="evening" className="flex items-center gap-2">
                        🌙
                        PM Routine ({eveningSteps.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="morning" className="mt-4">
                      {morningSteps.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No morning routine products
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {morningSteps
                            .sort((a, b) => {
                              return getCategoryOrder(a.category) - getCategoryOrder(b.category)
                            })
                            .map((step, index) => (
                              <div key={step.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {getCategoryDisplayName(step.category)}
                                  </span>
                                </div>
                                <RoutineStepCard
                                  step={step}
                                  stepNumber={index + 1}
                                  isFavorite={false}
                                  onToggleFavorite={() => {}}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="evening" className="mt-4">
                      {eveningSteps.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No evening routine products
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {eveningSteps
                            .sort((a, b) => {
                              return getCategoryOrder(a.category) - getCategoryOrder(b.category)
                            })
                            .map((step, index) => (
                              <div key={step.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {getCategoryDisplayName(step.category)}
                                  </span>
                                </div>
                                <RoutineStepCard
                                  step={step}
                                  stepNumber={index + 1}
                                  isFavorite={false}
                                  onToggleFavorite={() => {}}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

