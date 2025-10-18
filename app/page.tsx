"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  BeakerIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"

function AnimatedSkinConcerns() {
  const firstConcerns = [
    "dryness",
    "acne", 
    "aging",
    "dark spots",
    "rosacea",
    "combination"
  ]

  const secondConcerns = [
    "sensitivity",
    "oiliness",
    "fine lines", 
    "hyperpigmentation",
    "redness",
    "skin"
  ]

  const [firstIndex, setFirstIndex] = useState(0)
  const [secondIndex, setSecondIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [isAnimatingFirst, setIsAnimatingFirst] = useState(true)

  useEffect(() => {
    const animateConcerns = () => {
      if (isAnimatingFirst) {
        setFirstIndex((prevIndex) => (prevIndex + 1) % firstConcerns.length)
        setAnimationKey(prev => prev + 1)
        setIsAnimatingFirst(false)
      } else {
        setSecondIndex((prevIndex) => (prevIndex + 1) % secondConcerns.length)
        setAnimationKey(prev => prev + 1)
        setIsAnimatingFirst(true)
      }
    }

    const initialTimeout = setTimeout(() => {
      animateConcerns()
    }, 3000)

    const interval = setInterval(() => {
      animateConcerns()
    }, 6000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [isAnimatingFirst])

  return (
    <span className="font-semibold">
      <span className="inline-block">
        <span 
          key={isAnimatingFirst ? `first-${firstIndex}-${animationKey}` : `first-static-${firstIndex}`}
          className={`inline-block ${isAnimatingFirst ? 'animate-flip' : ''}`}
          style={{
            animationDuration: '0.6s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {firstConcerns[firstIndex]}
        </span>
      </span>
      <span className="mx-1">+</span>
      <span className="inline-block">
        <span 
          key={!isAnimatingFirst ? `second-${secondIndex}-${animationKey}` : `second-static-${secondIndex}`}
          className={`inline-block ${!isAnimatingFirst ? 'animate-flip' : ''}`}
          style={{
            animationDuration: '0.6s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {secondConcerns[secondIndex]}
        </span>
      </span>
    </span>
  )
}

export default function HomePage() {
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
      <FeaturesSection />
      <SkinQuizSection />
      <FinalCTASection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Title */}
          <div className="text-center lg:text-left space-y-8">
            <h1 className="font-sans font-black text-6xl md:text-7xl lg:text-8xl text-foreground leading-tight">Skincare Routine</h1>
            <h2 className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl text-foreground">Made for You</h2>
            <p className="font-sans text-xl text-muted-foreground leading-relaxed">
              Clinically personalized skincare for<br />
              <span className="block"> <AnimatedSkinConcerns /> </span>
            </p>
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
                <CarouselItem>
                  <div className="bg-card border border-border rounded-lg p-8 shadow-lg h-[28rem] flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="w-50 h-64 mx-auto rounded-lg overflow-hidden bg-muted">
                        <Image 
                          src="/placeholder.jpg" 
                          alt="Personalized Cleanser" 
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-sans font-bold text-2xl text-foreground">Personalized Cleanser</h3>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="bg-card border border-border rounded-lg p-8 shadow-lg h-[28rem] flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="w-50 h-64 mx-auto rounded-lg overflow-hidden bg-muted">
                        <Image 
                          src="/placeholder.jpg" 
                          alt="Personalized Treatment" 
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-sans font-bold text-2xl text-foreground">Personalized Treatment</h3>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="bg-card border border-border rounded-lg p-8 shadow-lg h-[28rem] flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="w-50 h-64 mx-auto rounded-lg overflow-hidden bg-muted">
                        <Image 
                          src="/placeholder.jpg" 
                          alt="Personalized Moisturizer" 
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-sans font-bold text-2xl text-foreground">Personalized Moisturizer</h3>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
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
              icon={AcademicCapIcon}
              title="Quick Assessment"
              description="Simple questions about your skin type and concerns"
            />
            <QuizStepCard 
              icon={CalendarIcon}
              title="Custom Routine"
              description="Get your personalized skincare routine and ingredient guide"
            />
            <QuizStepCard 
              icon={MagnifyingGlassIcon}
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
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any
  title: string
  description: string 
}) {
  return (
    <Card className="text-center p-6">
      <CardContent className="space-y-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-sans font-bold text-lg">{title}</h3>
        <p className="font-sans text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: BeakerIcon,
      title: "Science-Based",
      description: "Ingredients backed by clinical research and dermatologist recommendations"
    },
    {
      icon: ShieldCheckIcon,
      title: "Safe & Effective",
      description: "All ingredients are tested for safety and compatibility with your skin type"
    },
    {
      icon: BookOpenIcon,
      title: "Track Progress",
      description: "Monitor your skin's improvement with our built-in progress tracking"
    },
    {
      icon: HeartIcon,
      title: "Personalized",
      description: "Every routine is tailored specifically to your skin's unique needs"
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-sans font-bold text-3xl md:text-4xl text-foreground"> Why Choose SkinWise? </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto"> Science-backed ingredients, personalized routines, and proven results. </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <p className="font-sans text-muted-foreground"> {description} </p>
    </div>
  )
}

function FinalCTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="font-sans font-bold text-3xl md:text-4xl"> Ready to Transform Your Skin? </h2>
          <p className="font-sans text-lg opacity-90"> Join now to discover your perfect skincare routine </p>
        </div>
        <div className="pt-4">
          <Link href="/auth/signup">
            <Button size="lg" className="font-sans text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}