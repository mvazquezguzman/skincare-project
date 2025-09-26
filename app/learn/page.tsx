"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  BeakerIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

interface Article {
  id: string
  title: string
  category: string
  description: string
  readTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  content: string
  author: string
  publishDate: string
}

interface Myth {
  id: string
  statement: string
  isTrue: boolean
  explanation: string
  category: string
}

const articles: Article[] = [
  {
    id: "1",
    title: "Understanding Your Skin Barrier",
    category: "Skin Science",
    description: "Learn about the skin barrier function and why it's crucial for healthy skin.",
    readTime: "5 min",
    difficulty: "Beginner",
    tags: ["Skin Barrier", "Ceramides", "Hydration"],
    content: "The skin barrier is your skin's first line of defense...",
    author: "Dr. Sarah Chen",
    publishDate: "2024-01-15",
  },
  {
    id: "2",
    title: "The Science Behind Retinoids",
    category: "Ingredients",
    description: "Deep dive into how retinoids work and how to incorporate them safely.",
    readTime: "8 min",
    difficulty: "Intermediate",
    tags: ["Retinol", "Anti-aging", "Cell Turnover"],
    content: "Retinoids are vitamin A derivatives that work by...",
    author: "Dr. Michael Rodriguez",
    publishDate: "2024-01-10",
  },
  {
    id: "3",
    title: "Building Your First Skincare Routine",
    category: "Routines",
    description: "A step-by-step guide for skincare beginners.",
    readTime: "6 min",
    difficulty: "Beginner",
    tags: ["Routine", "Beginner", "Basics"],
    content: "Starting a skincare routine can feel overwhelming...",
    author: "Emma Thompson",
    publishDate: "2024-01-12",
  },
  {
    id: "4",
    title: "Chemical vs Physical Exfoliation",
    category: "Techniques",
    description: "Understanding the difference and choosing what's right for your skin.",
    readTime: "7 min",
    difficulty: "Intermediate",
    tags: ["Exfoliation", "AHA", "BHA"],
    content: "Exfoliation is key to healthy skin, but choosing the right method...",
    author: "Dr. Lisa Park",
    publishDate: "2024-01-08",
  },
  {
    id: "5",
    title: "Ingredient Layering Guide",
    category: "Techniques",
    description: "Master the art of layering skincare products for maximum effectiveness.",
    readTime: "10 min",
    difficulty: "Advanced",
    tags: ["Layering", "pH", "Compatibility"],
    content: "The order in which you apply skincare products matters...",
    author: "Dr. James Wilson",
    publishDate: "2024-01-05",
  },
  {
    id: "6",
    title: "Sensitive Skin Care Essentials",
    category: "Skin Types",
    description: "How to care for sensitive skin and avoid common irritants.",
    readTime: "6 min",
    difficulty: "Beginner",
    tags: ["Sensitive Skin", "Gentle", "Fragrance-Free"],
    content: "Sensitive skin requires special attention and gentle products...",
    author: "Dr. Anna Martinez",
    publishDate: "2024-01-03",
  },
]

const myths: Myth[] = [
  {
    id: "1",
    statement: "You should wash your face with hot water to open pores",
    isTrue: false,
    explanation:
      "Hot water can strip your skin of natural oils and cause irritation. Lukewarm water is best for cleansing.",
    category: "Cleansing",
  },
  {
    id: "2",
    statement: "Natural ingredients are always better than synthetic ones",
    isTrue: false,
    explanation:
      "Natural doesn't always mean better. Many synthetic ingredients are safer, more stable, and more effective than their natural counterparts.",
    category: "Ingredients",
  },
  {
    id: "3",
    statement: "You need to use different products for day and night",
    isTrue: true,
    explanation:
      "Day routines focus on protection (sunscreen, antioxidants) while night routines focus on repair (retinoids, heavier moisturizers).",
    category: "Routines",
  },
  {
    id: "4",
    statement: "Oily skin doesn't need moisturizer",
    isTrue: false,
    explanation:
      "All skin types need hydration. Skipping moisturizer can actually make oily skin produce more oil to compensate.",
    category: "Skin Types",
  },
  {
    id: "5",
    statement: "Higher SPF means you can stay in the sun longer",
    isTrue: false,
    explanation:
      "SPF indicates protection level, not duration. You should reapply sunscreen every 2 hours regardless of SPF.",
    category: "Sun Protection",
  },
  {
    id: "6",
    statement: "You should introduce new products one at a time",
    isTrue: true,
    explanation:
      "This helps you identify which product is causing any reactions and allows your skin to adjust gradually.",
    category: "Routines",
  },
]

const categories = ["All", "Skin Science", "Ingredients", "Routines", "Techniques", "Skin Types"]

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600 bg-green-50 border-green-200"
      case "Intermediate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Advanced":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="font-open-sans text-muted-foreground hover:text-foreground"
            >
              ← Back to Articles
            </Button>

            <article className="space-y-6">
              <header className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-open-sans">
                    {selectedArticle.category}
                  </Badge>
                  <Badge variant="outline" className={getDifficultyColor(selectedArticle.difficulty)}>
                    {selectedArticle.difficulty}
                  </Badge>
                </div>
                <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-open-sans">
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime} read</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.publishDate).toLocaleDateString()}</span>
                </div>
                <p className="font-open-sans text-lg text-muted-foreground leading-relaxed">
                  {selectedArticle.description}
                </p>
              </header>

              <div className="prose prose-lg max-w-none">
                <div className="font-open-sans text-foreground leading-relaxed space-y-4">
                  <p>{selectedArticle.content}</p>
                  <p>
                    This is where the full article content would be displayed. The article would include detailed
                    information about {selectedArticle.title.toLowerCase()}, with scientific explanations, practical
                    tips, and actionable advice for readers.
                  </p>
                  <p>
                    Each article in our educational library is carefully researched and reviewed by skincare
                    professionals to ensure accuracy and safety. We believe in empowering our users with knowledge to
                    make informed decisions about their skincare journey.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-montserrat font-bold text-lg text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-open-sans">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <AcademicCapIcon className="h-12 w-12 text-primary" />
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">Skincare Education Hub</h1>
            <p className="font-open-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Expand your skincare knowledge with expert-written articles, guides, and myth-busting content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader className="text-center">
                <BookOpenIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="font-montserrat font-bold text-lg text-foreground">Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-open-sans text-sm text-muted-foreground text-center">
                  In-depth guides and scientific explanations
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="text-center">
                <BeakerIcon className="h-8 w-8 text-secondary mx-auto mb-2" />
                <CardTitle className="font-montserrat font-bold text-lg text-foreground">Myth Busters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-open-sans text-sm text-muted-foreground text-center">
                  Separating skincare facts from fiction
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="text-center">
                <LightBulbIcon className="h-8 w-8 text-accent mx-auto mb-2" />
                <CardTitle className="font-montserrat font-bold text-lg text-foreground">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-open-sans text-sm text-muted-foreground text-center">
                  Bite-sized advice for better skin
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles, topics, or ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-open-sans"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="font-open-sans"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="font-open-sans">
                        {article.category}
                      </Badge>
                      <Badge variant="outline" className={getDifficultyColor(article.difficulty)}>
                        {article.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="font-montserrat font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-open-sans text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-open-sans">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <span>By {article.author}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-open-sans">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs font-open-sans">
                          +{article.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" className="font-open-sans p-0 h-auto text-primary hover:text-primary/80">
                      Read article
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">No articles found</h3>
                <p className="font-open-sans text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-montserrat font-bold text-2xl md:text-3xl text-foreground mb-4">
                Skincare Myths vs Facts
              </h2>
              <p className="font-open-sans text-muted-foreground max-w-2xl mx-auto">
                Test your skincare knowledge and learn the truth behind common misconceptions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myths.map((myth) => (
                <Card key={myth.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {myth.isTrue ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-montserrat font-bold text-base text-foreground leading-tight">
                          {myth.statement}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2 font-open-sans">
                          {myth.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-montserrat font-bold text-sm ${
                          myth.isTrue ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {myth.isTrue ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <p className="font-open-sans text-sm text-muted-foreground leading-relaxed">{myth.explanation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
