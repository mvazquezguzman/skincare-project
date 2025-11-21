"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, Activity } from "lucide-react"
import AnalysisResults from "@/components/routine/AnalysisResults"
import { getAllUserAnalyses, getRoutineHistory, RoutineAnalysis, UserRoutine } from "@/lib/routine-service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AnalysisReportsSectionProps {
  userId: string
}

export default function AnalysisReportsSection({ userId }: AnalysisReportsSectionProps) {
  const [reports, setReports] = useState<RoutineAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<RoutineAnalysis | null>(null)
  const [routineNames, setRoutineNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const [analyses, routines] = await Promise.all([
          getAllUserAnalyses(userId),
          getRoutineHistory(userId)
        ])

        setReports(analyses)
        setRoutineNames(mapRoutineNames(routines))
      } catch (error) {
        console.error("Error fetching analysis reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [userId])

  const mapRoutineNames = (routines: UserRoutine[]) => {
    return routines.reduce<Record<string, string>>((acc, routine) => {
      const label = routine.name || `Routine from ${formatDate(routine.created_at)}`
      acc[routine.id] = label
      return acc
    }, {})
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (isLoading) {
    return (
      <div className="mb-6">
        <h1 className="font-montserrat font-black text-3xl mb-6">ANALYSIS REPORTS</h1>
        <Card className="border shadow-sm">
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">Loading analysis reports...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="mb-6">
        <h1 className="font-montserrat font-black text-3xl mb-6">ANALYSIS REPORTS</h1>
        <Card className="border shadow-sm">
          <CardContent className="p-8">
            <p className="text-muted-foreground text-center">
              No analysis reports yet. Save a routine analysis to see it here.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h1 className="font-montserrat font-black text-3xl mb-6">ANALYSIS REPORTS</h1>

      <div className="space-y-4">
        {reports.map((report) => {
          const score = report.analysis_result?.overallScore
          const routineLabel = routineNames[report.routine_id]
          const summaryPreview = report.analysis_result?.summary

          return (
            <Card key={report.id} className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {routineLabel || "Routine Analysis"}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      {score !== undefined && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            <span>Score: {score}/100</span>
                          </div>
                        </>
                      )}
                    </div>
                    {summaryPreview && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {summaryPreview}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveReport(report)}
                    className="flex items-center"
                  >
                    <span className="mr-2">View</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!activeReport} onOpenChange={(open) => !open ? setActiveReport(null) : null}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeReport ? (routineNames[activeReport.routine_id] || "Routine Analysis") : "Analysis Report"}
            </DialogTitle>
            {activeReport && (
              <DialogDescription className="text-sm text-muted-foreground">
                Saved on {formatDate(activeReport.created_at)}
              </DialogDescription>
            )}
          </DialogHeader>
          {activeReport && (
            <AnalysisResults result={activeReport.analysis_result || {}} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


