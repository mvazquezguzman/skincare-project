import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnalysisResult {
  overallScore?: number
  summary?: string
  conflicts?: Array<{
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    affectedProducts?: string[]
    recommendation?: string
  }>
  recommendations?: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
}

interface AnalysisResultsProps {
  result: AnalysisResult
  onSave?: () => void
  isSaving?: boolean
  isSaved?: boolean
}

export default function AnalysisResults({ result, onSave, isSaving = false, isSaved = false }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Save Button Header */}
      {onSave && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Analysis Results</h3>
                <p className="text-sm text-muted-foreground">Save this analysis to your profile</p>
              </div>
              <Button 
                onClick={onSave} 
                disabled={isSaving || isSaved}
                variant={isSaved ? "outline" : "default"}
              >
                {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Overall Score */}
      {result.overallScore !== undefined && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Overall Routine Score</h3>
              <div className="text-3xl font-bold">
                {result.overallScore}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  result.overallScore >= 80 ? 'bg-green-500' :
                  result.overallScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {result.summary && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {result.conflicts && result.conflicts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">⚠️ Detected Conflicts</h3>
            <div className="space-y-4">
              {result.conflicts.map((conflict, index) => (
                <div 
                  key={index}
                  className={`border-l-4 p-4 rounded ${
                    conflict.severity === 'high' ? 'border-red-500 bg-red-50' :
                    conflict.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{conflict.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      conflict.severity === 'high' ? 'bg-red-200 text-red-800' :
                      conflict.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {conflict.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
                  {conflict.affectedProducts && conflict.affectedProducts.length > 0 && (
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Affected Products:</strong> {conflict.affectedProducts.join(', ')}
                    </p>
                  )}
                  {conflict.recommendation && (
                    <p className="text-sm text-gray-800 mt-2">
                      <strong>💡 Recommendation:</strong> {conflict.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">💡 Recommendations</h3>
            <div className="space-y-4">
              {result.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`border-l-4 p-4 rounded ${
                    rec.priority === 'high' ? 'border-purple-500 bg-purple-50' :
                    rec.priority === 'medium' ? 'border-indigo-500 bg-indigo-50' :
                    'border-gray-400 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-purple-200 text-purple-800' :
                      rec.priority === 'medium' ? 'bg-indigo-200 text-indigo-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues Message */}
      {(!result.conflicts || result.conflicts.length === 0) && 
       (!result.recommendations || result.recommendations.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-green-600 font-semibold">✅ No conflicts detected!</p>
            <p className="text-muted-foreground mt-2">Your routine looks good. Keep up the great work!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

