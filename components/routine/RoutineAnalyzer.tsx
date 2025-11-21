import { UserProfile, RoutineStep } from "@/lib/profile-types"
import { getCategoryDisplayName } from "@/lib/routine-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnalysisResults from "./AnalysisResults"

interface RoutineAnalyzerProps {
  profile: UserProfile
  analysisResult: any
  analysisError: string | null
  isAnalyzing: boolean
  onAnalyze: () => void
  onSwitchToBuilder: () => void
  onSaveAnalysis?: () => void
  isSavingAnalysis?: boolean
  isAnalysisSaved?: boolean
}

export default function RoutineAnalyzer({
  profile,
  analysisResult,
  analysisError,
  isAnalyzing,
  onAnalyze,
  onSwitchToBuilder,
  onSaveAnalysis,
  isSavingAnalysis = false,
  isAnalysisSaved = false
}: RoutineAnalyzerProps) {
  const hasRoutine = profile.currentRoutine.morning.length > 0 || profile.currentRoutine.evening.length > 0

  return (
    <div className="space-y-8">
      {/* Current Routine Display */}
      {hasRoutine && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">My Routine</h3>
            <div className="space-y-4">
              {profile.currentRoutine.morning.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">☀️ Morning Routine</h4>
                  <div className="space-y-2">
                    {profile.currentRoutine.morning.map((step) => (
                      <div key={step.id} className="text-sm">
                        <span className="font-medium">{getCategoryDisplayName(step.category)}:</span>{' '}
                        {step.brand && <span className="text-muted-foreground">{step.brand} </span>}
                        {step.productName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profile.currentRoutine.evening.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">🌙 Evening Routine</h4>
                  <div className="space-y-2">
                    {profile.currentRoutine.evening.map((step) => (
                      <div key={step.id} className="text-sm">
                        <span className="font-medium">{getCategoryDisplayName(step.category)}:</span>{' '}
                        {step.brand && <span className="text-muted-foreground">{step.brand} </span>}
                        {step.productName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyze Button */}
      <Card>
        <CardContent className="p-8 text-center">
          {!hasRoutine ? (
            <div>
              <p className="text-muted-foreground mb-4">You don&rsquo;t have a saved routine yet. Please create and save a routine first.</p>
              <Button onClick={onSwitchToBuilder}>Go to Routine Builder</Button>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-6">Click the button below to analyze your routine for conflicts and get personalized recommendations.</p>
              <Button 
                onClick={onAnalyze} 
                disabled={isAnalyzing}
                size="lg"
                className="min-w-[200px]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Routine"}
              </Button>
              {analysisError && (
                <p className="text-red-500 mt-4">{analysisError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <AnalysisResults 
          result={analysisResult} 
          onSave={onSaveAnalysis}
          isSaving={isSavingAnalysis}
          isSaved={isAnalysisSaved}
        />
      )}
    </div>
  )
}
