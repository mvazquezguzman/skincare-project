export interface WeatherData {
  temperature: number
  humidity: number
  uvIndex: number
  condition: string
  airQuality: number
}

export interface DailyInsight {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "weather" | "routine" | "ingredient" | "general"
  actionable: boolean
  recommendation?: string
}

export interface RoutineAdjustment {
  step: string
  adjustment: string
  reason: string
  priority: "high" | "medium" | "low"
}

export interface DailyInsightsData {
  weather: WeatherData
  insights: DailyInsight[]
  routineAdjustments: RoutineAdjustment[]
  weatherRecommendations: string[]
  dailyTips: string[]
}

class DailyInsightsService {
  private generateMockWeather(): WeatherData {
    return {
      temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
      humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
      uvIndex: Math.floor(Math.random() * 10) + 1, // 1-10
      condition: ["sunny", "cloudy", "rainy", "windy"][Math.floor(Math.random() * 4)],
      airQuality: Math.floor(Math.random() * 100) + 1, // 1-100
    }
  }

  private generateInsights(weather: WeatherData): DailyInsight[] {
    const insights: DailyInsight[] = []

    // Weather-based insights
    if (weather.uvIndex > 7) {
      insights.push({
        id: "uv-high",
        title: "High UV Index Alert",
        description: `UV index is ${weather.uvIndex} today. Extra sun protection needed.`,
        priority: "high",
        category: "weather",
        actionable: true,
        recommendation: "Apply broad-spectrum SPF 30+ and reapply every 2 hours",
      })
    }

    if (weather.humidity < 40) {
      insights.push({
        id: "low-humidity",
        title: "Low Humidity Detected",
        description: `Humidity is ${weather.humidity}%. Your skin may need extra hydration.`,
        priority: "medium",
        category: "weather",
        actionable: true,
        recommendation: "Use a heavier moisturizer and consider a hydrating serum",
      })
    }

    if (weather.airQuality > 70) {
      insights.push({
        id: "poor-air-quality",
        title: "Poor Air Quality",
        description: "High pollution levels may affect your skin barrier.",
        priority: "medium",
        category: "weather",
        actionable: true,
        recommendation: "Use antioxidant serums and gentle cleansing",
      })
    }

    // General skincare insights
    insights.push({
      id: "hydration-reminder",
      title: "Hydration Check",
      description: "Remember to drink water throughout the day for healthy skin.",
      priority: "low",
      category: "general",
      actionable: true,
      recommendation: "Aim for 8 glasses of water daily",
    })

    return insights
  }

  private generateRoutineAdjustments(weather: WeatherData): RoutineAdjustment[] {
    const adjustments: RoutineAdjustment[] = []

    if (weather.uvIndex > 6) {
      adjustments.push({
        step: "Morning Sunscreen",
        adjustment: "Use SPF 50+ instead of regular SPF",
        reason: `High UV index (${weather.uvIndex})`,
        priority: "high",
      })
    }

    if (weather.humidity < 45) {
      adjustments.push({
        step: "Moisturizer",
        adjustment: "Switch to a heavier, more occlusive moisturizer",
        reason: `Low humidity (${weather.humidity}%)`,
        priority: "medium",
      })
    }

    if (weather.condition === "windy") {
      adjustments.push({
        step: "Barrier Protection",
        adjustment: "Add a protective balm or occlusive layer",
        reason: "Windy conditions can damage skin barrier",
        priority: "medium",
      })
    }

    return adjustments
  }

  private generateWeatherRecommendations(weather: WeatherData): string[] {
    const recommendations: string[] = []

    if (weather.temperature > 25) {
      recommendations.push("Use lightweight, gel-based products")
      recommendations.push("Consider oil-free formulations")
    } else if (weather.temperature < 15) {
      recommendations.push("Switch to richer, more nourishing products")
      recommendations.push("Protect exposed skin from cold")
    }

    if (weather.condition === "rainy") {
      recommendations.push("Waterproof sunscreen is still important")
      recommendations.push("Indoor air may be drier - maintain hydration")
    }

    return recommendations
  }

  private generateDailyTips(): string[] {
    const tips = [
      "Clean your phone screen regularly - it touches your face often",
      "Change your pillowcase twice a week for cleaner skin",
      "Avoid touching your face throughout the day",
      "Take progress photos in consistent lighting",
      "Patch test new products on your inner arm first",
      "Remove makeup before working out",
      "Use lukewarm water when cleansing",
      "Apply products to slightly damp skin for better absorption",
    ]

    return tips.sort(() => 0.5 - Math.random()).slice(0, 3)
  }

  getDailyInsights(): DailyInsightsData {
    const weather = this.generateMockWeather()

    return {
      weather,
      insights: this.generateInsights(weather),
      routineAdjustments: this.generateRoutineAdjustments(weather),
      weatherRecommendations: this.generateWeatherRecommendations(weather),
      dailyTips: this.generateDailyTips(),
    }
  }
}

export const dailyInsightsService = new DailyInsightsService()
