import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { CompatibilityReport } from "@/lib/ingredient-compatibility"

interface CompatibilityReportProps {
  report: CompatibilityReport
  onClose: () => void
}

export default function CompatibilityReportComponent({ report, onClose }: CompatibilityReportProps) {
  return (
    <Card className="mt-6 border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Ingredient Compatibility Analysis
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{report.summary.totalProducts}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Conflicts</p>
              <p className="text-2xl font-bold text-red-700">{report.summary.conflicts}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Cautions</p>
              <p className="text-2xl font-bold text-yellow-700">{report.summary.cautions}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Recommendations</p>
              <p className="text-2xl font-bold text-green-700">{report.summary.recommendations}</p>
            </div>
          </div>

          {/* Issues */}
          {report.issues.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">No compatibility issues found!</p>
                <p className="text-sm text-green-700 mt-1">All products in your routine are compatible with each other.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Issues Found:</h3>
              {report.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    issue.type === 'conflict'
                      ? 'bg-red-50 border-red-200'
                      : issue.type === 'caution'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {issue.type === 'conflict' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : issue.type === 'caution' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        issue.type === 'conflict'
                          ? 'text-red-800'
                          : issue.type === 'caution'
                          ? 'text-yellow-800'
                          : 'text-green-800'
                      }`}>
                        {issue.message}
                      </p>
                      {issue.recommendation && (
                        <p className={`text-sm mt-1 ${
                          issue.type === 'conflict'
                            ? 'text-red-700'
                            : issue.type === 'caution'
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          {issue.recommendation}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {issue.ingredients.map((ing, ingIdx) => (
                          <Badge
                            key={ingIdx}
                            variant="outline"
                            className="text-xs"
                          >
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
