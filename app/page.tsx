"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ContainerTextFlip } from "@/components/ui/container-text-flip"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import {
  ShieldCheckIcon,
  BookOpenIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"

type ProductCategory = "Face Cleanser" | "Toner" | "Moisturizer"

type SkincareProduct = {
  id: string
  category: ProductCategory
  name: string
  brand?: string | null
  description?: string | null
  image: string
  productURL?: string | null
}

const PRODUCT_CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  "Face Cleanser": ["Face Cleanser", "Cleanser"],
  Toner: ["Toner", "Essence"],
  Moisturizer: ["Moisturizer", "Moisturizing", "Cream"],
}

function getFallbackSlides(): SkincareProduct[] {
  return [
    {
      id: "fallback-cleanser",
      category: "Face Cleanser",
      name: "Personalized Cleanser",
      description: "We’ll pick a gentle daily cleanser curated from your routine.",
      image: "/placeholder.jpg",
    },
    {
      id: "fallback-toner",
      category: "Toner",
      name: "Balancing Toner",
      description: "Hydrate and prep with soothing actives that fit your skin goals.",
      image: "/placeholder.jpg",
    },
    {
      id: "fallback-moisturizer",
      category: "Moisturizer",
      name: "Barrier-Lock Moisturizer",
      description: "Seal in treatment steps without clogging or heaviness.",
      image: "/placeholder.jpg",
    },
  ]
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to /home
  }

  return (
    <div className="min-h-screen bg-background">
      <GuestLandingPage />
    </div>
  )
}

function GuestLandingPage() {
  return (
    <>
      <HeroSection />
      <SkinQuizSection />
      <FeaturesSection />
      <FinalCTASection />
    </>
  )
}

function HeroSection() {
  const [featuredSlides, setFeaturedSlides] = useState<SkincareProduct[]>([])
  const [isCarouselLoading, setIsCarouselLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchFeaturedProducts() {
      setIsCarouselLoading(true)

      try {
        const categoryRequests: Array<Promise<SkincareProduct | null>> = (
          Object.keys(PRODUCT_CATEGORY_KEYWORDS) as ProductCategory[]
        ).map(async (category) => {
            const keywords = PRODUCT_CATEGORY_KEYWORDS[category]
            let query = supabase
              .from("sephora_products")
              .select("productId, productName, productBrand, imageURL, productURL, categoryName, description")
              .not("imageURL", "is", null)
              .limit(24)
              .order("created_at", { ascending: false })

            const filterClauses = keywords
              .flatMap((keyword) => [
                `categoryName.ilike.%${keyword}%`,
                `productName.ilike.%${keyword}%`,
              ])
              .join(",")

            if (filterClauses.length) {
              query = query.or(filterClauses)
            }

            const { data, error } = await query

            if (error) {
              console.error(`Failed to load ${category} products`, error)
              return null
            }

            const withImages = (data || []).filter((product) => Boolean(product.imageURL))

            if (!withImages.length) {
              return null
            }

            const randomProduct = withImages[Math.floor(Math.random() * withImages.length)]

            const product: SkincareProduct = {
              id: randomProduct.productId,
              category,
              name: randomProduct.productName,
              brand: randomProduct.productBrand,
              description: randomProduct.description,
              image: randomProduct.imageURL,
              productURL: randomProduct.productURL,
            }

            return product
          })

        const slides = (await Promise.all(categoryRequests)).filter(
          (slide): slide is SkincareProduct => Boolean(slide)
        )

        if (!isMounted) return

        setFeaturedSlides(slides.length ? slides : getFallbackSlides())
      } catch (error) {
        console.error("Failed to load featured products", error)
        if (isMounted) {
          setFeaturedSlides(getFallbackSlides())
        }
      } finally {
        if (isMounted) {
          setIsCarouselLoading(false)
        }
      }
    }

    fetchFeaturedProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Title */}
          <div className="text-center lg:text-left space-y-8">
            <h1 className="font-playfair font-black text-6xl md:text-7xl lg:text-8xl text-foreground leading-tight">SkinWise</h1>
            <p className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl text-foreground"> Personalized skincare routine made for</p>
            <h3 className="font-sans text-xl text-muted-foreground leading-relaxed">
              <span className="block">
                <ContainerTextFlip 
                  words={[
                    "dryness",
                    "acne",
                    "aging",
                    "dark spots",
                    "rosacea",
                    "combination",
                    "sensitivity",
                    "oiliness",
                    "fine lines",
                    "hyperpigmentation",
                    "redness"
                  ]}
                />
              </span>
            </h3>
            <div className="pt-4">
              <Link href="/auth/signup"> <Button size="lg" className="font-sans text-lg px-8 py-6">Get Started</Button> </Link>
            </div>
          </div>

          {/* Right Content - Product Carousel */}
          <div className="relative">
            <Carousel 
              className="w-full max-w-md mx-auto"
              opts={{
                loop: true,
                align: "center"
              }}
            >
              <CarouselContent>
                {(isCarouselLoading ? getFallbackSlides() : featuredSlides).map((product) => (
                  <CarouselItem key={product.name}>
                    <div className="bg-card border border-border rounded-lg p-10 shadow-lg h-[34rem] flex flex-col justify-center">
                      <div className="space-y-6">
                        <div className="w-50 h-72 mx-auto rounded-lg overflow-hidden bg-muted">
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={320}
                            height={360}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{product.category}</p>
                          <h3 className="font-sans font-bold text-2xl text-foreground">{product.name}</h3>
                          {product.brand && (
                            <p className="font-sans text-sm text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}

function SkinQuizSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground"> Take Our Skin Quiz </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto"> Answer a few questions about your skin and get personalized recommendations in just a few minutes. </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <QuizStepCard 
              title="Quick Assessment"
              description="Simple questions about your skin type and concerns"
            />
            <QuizStepCard 
              title="Custom Routine"
              description="Get your personalized skincare routine and ingredient guide"
            />
            <QuizStepCard 
              title="Product Analysis"
              description="Analyzes skincare products to find the best ones for your skin"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function QuizStepCard({ 
  title, 
  description 
}: { 
  title: string
  description: string 
}) {
  return (
    <Card className="text-center p-6">
      <CardContent className="space-y-4">
        <h3 className="font-sans font-bold text-lg">{title}</h3>
        <p className="font-sans text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: HeartIcon,
      title: "Personalized",
      description: "Every routine is tailored specifically to your skin's unique needs"
    },
    {
      icon: BookOpenIcon,
      title: "Track Progress",
      description: "Monitor your skin's improvement with your daily skincare diary"
    },
    {
      icon: ShieldCheckIcon,
      title: "Safe & Effective",
      description: "Browser through our ingredient database to find the best ingredients for your skin"
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground">
              Why Choose <span className="font-playfair">SkinWise</span>?
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized routines with ingredient compatibility analysis. Discover the best ingredients for your skin and build your perfect routine today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any
  title: string
  description: string 
}) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"> 
      <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-sans font-bold text-xl">{title}</h3>
      <p className="font-sans text-muted-foreground">{description}</p>
    </div>
  )
}

function FinalCTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="font-sans font-bold text-3xl md:text-4xl"> Ready to Transform Your Skin? </h2>
          <p className="font-sans text-lg opacity-90"> Join now to discover and build your perfect routine today. </p>
        </div>
        <div className="pt-4">
          <Link href="/auth/signup">
            <Button 
              size="lg" 
              variant="secondary" 
              className="font-sans text-lg px-8 py-6"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}