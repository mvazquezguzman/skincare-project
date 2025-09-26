export interface WeatherData {
  temperature: number
  humidity: number
  uvIndex: number
  condition: "sunny" | "cloudy" | "rainy" | "windy" | "snowy"
  airQuality: number
  location: string
}

export interface WeatherRecommendation {
  category: string
  recommendation: string
  priority: "high" | "medium" | "low"
  reason: string
}

export class WeatherService {
  private static mockLocations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
  ]

  static async getCurrentWeather(): Promise<WeatherData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      temperature: Math.floor(Math.random() * 35) + 5, // 5-40°C
      humidity: Math.floor(Math.random() * 70) + 20, // 20-90%
      uvIndex: Math.floor(Math.random() * 11), // 0-10
      condition: ["sunny", "cloudy", "rainy", "windy", "snowy"][
        Math.floor(Math.random() * 5)
      ] as WeatherData["condition"],
      airQuality: Math.floor(Math.random() * 100) + 1, // 1-100 (lower is better)
      location: this.mockLocations[Math.floor(Math.random() * this.mockLocations.length)],
    }
  }

  static getSkincareRecommendations(weather: WeatherData): WeatherRecommendation[] {
    const recommendations: WeatherRecommendation[] = []

    // Temperature-based recommendations
    if (weather.temperature > 30) {
      recommendations.push({
        category: "Temperature",
        recommendation: "Use lightweight, gel-based moisturizers and oil-free products",
        priority: "high",
        reason: `High temperature (${weather.temperature}°C) can increase oil production`,
      })
    } else if (weather.temperature < 10) {
      recommendations.push({
        category: "Temperature",
        recommendation: "Switch to richer, more occlusive moisturizers and protect exposed skin",
        priority: "high",
        reason: `Cold temperature (${weather.temperature}°C) can dry out and damage skin`,
      })
    }

    // Humidity-based recommendations
    if (weather.humidity < 30) {
      recommendations.push({
        category: "Humidity",
        recommendation: "Use hydrating serums with hyaluronic acid and heavier moisturizers",
        priority: "high",
        reason: `Low humidity (${weather.humidity}%) can cause skin dehydration`,
      })
    } else if (weather.humidity > 80) {
      recommendations.push({
        category: "Humidity",
        recommendation: "Use lighter formulations and ensure proper cleansing",
        priority: "medium",
        reason: `High humidity (${weather.humidity}%) can increase bacterial growth`,
      })
    }

    // UV Index recommendations
    if (weather.uvIndex >= 8) {
      recommendations.push({
        category: "UV Protection",
        recommendation: "Use broad-spectrum SPF 50+, reapply every 2 hours, seek shade",
        priority: "high",
        reason: `Very high UV index (${weather.uvIndex}) poses significant skin damage risk`,
      })
    } else if (weather.uvIndex >= 6) {
      recommendations.push({
        category: "UV Protection",
        recommendation: "Use broad-spectrum SPF 30+, wear protective clothing",
        priority: "high",
        reason: `High UV index (${weather.uvIndex}) requires strong sun protection`,
      })
    } else if (weather.uvIndex >= 3) {
      recommendations.push({
        category: "UV Protection",
        recommendation: "Use daily SPF 30, sunglasses recommended",
        priority: "medium",
        reason: `Moderate UV index (${weather.uvIndex}) still requires protection`,
      })
    }

    // Condition-based recommendations
    switch (weather.condition) {
      case "windy":
        recommendations.push({
          category: "Weather Condition",
          recommendation: "Apply protective balms to prevent windburn and barrier damage",
          priority: "medium",
          reason: "Wind can strip natural oils and damage the skin barrier",
        })
        break
      case "rainy":
        recommendations.push({
          category: "Weather Condition",
          recommendation: "Use waterproof sunscreen, maintain indoor humidity",
          priority: "low",
          reason: "Rain doesn't eliminate UV exposure, and indoor heating can dry skin",
        })
        break
      case "snowy":
        recommendations.push({
          category: "Weather Condition",
          recommendation: "Use high SPF (snow reflects UV), rich moisturizers for cold protection",
          priority: "high",
          reason: "Snow reflects up to 80% of UV rays, increasing exposure risk",
        })
        break
    }

    // Air quality recommendations
    if (weather.airQuality > 100) {
      recommendations.push({
        category: "Air Quality",
        recommendation: "Use antioxidant serums, gentle cleansing, consider air purifiers",
        priority: "high",
        reason: `Poor air quality (${weather.airQuality}) can cause oxidative stress and inflammation`,
      })
    } else if (weather.airQuality > 50) {
      recommendations.push({
        category: "Air Quality",
        recommendation: "Include vitamin C serum in routine, thorough but gentle cleansing",
        priority: "medium",
        reason: `Moderate air quality (${weather.airQuality}) may affect skin health`,
      })
    }

    return recommendations
  }

  static getProductAdjustments(weather: WeatherData): Array<{
    product: string
    adjustment: string
    reason: string
  }> {
    const adjustments = []

    if (weather.temperature > 25 && weather.humidity > 60) {
      adjustments.push({
        product: "Moisturizer",
        adjustment: "Switch to gel or water-based formula",
        reason: "Hot and humid conditions require lighter textures",
      })
    }

    if (weather.temperature < 15 || weather.humidity < 40) {
      adjustments.push({
        product: "Moisturizer",
        adjustment: "Use cream or oil-based formula",
        reason: "Cold or dry conditions require more occlusive protection",
      })
    }

    if (weather.uvIndex > 6) {
      adjustments.push({
        product: "Sunscreen",
        adjustment: "Upgrade to SPF 50+ with zinc oxide",
        reason: "High UV requires maximum protection",
      })
    }

    return adjustments
  }
}
