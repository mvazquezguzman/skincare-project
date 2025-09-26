"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Sun, Droplets, Wind, Eye, AlertTriangle, Lightbulb, Calendar } from "lucide-react"
import { dailyInsightsService, type DailyInsightsData } from "@/lib/daily-insights-service"
import { WeatherService } from "@/lib/weather-service"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [insights, setInsights] = useState<DailyInsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Redirect to login if not authenticated
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
            <h1 className="font-montserrat font-bold text-2xl text-foreground mb-4">
              Access Denied
            </h1>
            <p className="font-open-sans text-muted-foreground mb-6">
              You need to be logged in to view your insights.
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

  const loadInsights = async () => {
    setIsLoading(true)
    try {
      const data = await dailyInsightsService.generateDailyInsights()
      setInsights(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInsights()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-600" />
      case "recommendation":
        return <Eye className="w-5 h-5 text-purple-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your daily insights...</p>
        </div>
      </main>
    )
  }

  if (!insights) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load insights</p>
          <Button onClick={loadInsights}>Try Again</Button>
        </div>
      </main>
    )
  }

  const uvDescription = WeatherService.getUVIndexDescription(insights.weather.uvIndex)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Insights</h1>
          <p className="text-muted-foreground">Personalized recommendations for {insights.date.toLocaleDateString()}</p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <Button onClick={loadInsights} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Weather Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Today's Weather
            </CardTitle>
            <CardDescription>{insights.weather.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{insights.weather.temperature}°F</div>
                <div className="text-sm text-muted-foreground capitalize">{insights.weather.condition}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Droplets className="w-5 h-5" />
                  {insights.weather.humidity}%
                </div>
                <div className="text-sm text-muted-foreground">Humidity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Wind className="w-5 h-5" />
                  {insights.weather.windSpeed}
                </div>
                <div className="text-sm text-muted-foreground">Wind (mph)</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${uvDescription.color}`}>{insights.weather.uvIndex}</div>
                <div className="text-sm text-muted-foreground">UV Index</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {uvDescription.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Key Insights</CardTitle>
            <CardDescription>Important recommendations based on today's conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.insights.slice(0, 4).map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.actionable && <p className="text-sm font-medium">💡 {insight.actionable}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Recommendations */}
        <Tabs defaultValue="routine" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routine">Routine Adjustments</TabsTrigger>
            <TabsTrigger value="weather">Weather Recommendations</TabsTrigger>
            <TabsTrigger value="tips">Daily Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Morning Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.routineAdjustments.morning.length > 0 ? (
                    <ul className="space-y-2">
                      {insights.routineAdjustments.morning.map((adjustment, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{adjustment}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No adjustments needed for your morning routine today.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evening Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.routineAdjustments.evening.length > 0 ? (
                    <ul className="space-y-2">
                      {insights.routineAdjustments.evening.map((adjustment, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{adjustment}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No adjustments needed for your evening routine today.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <div className="grid gap-4">
              {insights.weatherRecommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    {rec.products && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">Recommended products:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.products.map((product, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {rec.timing && (
                      <p className="text-sm">
                        <span className="font-medium">Timing:</span> {rec.timing}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Skincare Tips</CardTitle>
                <CardDescription>General advice to keep your skin healthy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {insights.skincareTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
