"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ContainerTextFlipProps {
  words: string[]
  className?: string
  interval?: number
}

// Flip between two words in a container
export function ContainerTextFlip({ 
  words, 
  className,
  interval = 3000 
}: ContainerTextFlipProps) {
  const [firstIndex, setFirstIndex] = useState(0)
  const [secondIndex, setSecondIndex] = useState(() => words.length > 1 ? 1 : 0)
  const [isAnimatingFirst, setIsAnimatingFirst] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  
  const firstIndexRef = useRef(0)
  const secondIndexRef = useRef(words.length > 1 ? 1 : 0)
  
  useEffect(() => {
    firstIndexRef.current = firstIndex
  }, [firstIndex])
  
  useEffect(() => {
    secondIndexRef.current = secondIndex
  }, [secondIndex])

  useEffect(() => {
    if (words.length === 0) return

    let changeTimer: NodeJS.Timeout

    const timer = setTimeout(() => {
      setIsAnimatingFirst(prev => {
        const willAnimateFirst = !prev
        setAnimationKey(prev => prev + 1)
        
        // Change word at the midpoint of the flip animation (when rotated 90deg)
        changeTimer = setTimeout(() => {
          if (willAnimateFirst) {
            setFirstIndex((prevIndex) => {
              let nextIndex = (prevIndex + 1) % words.length
              // Ensure it's different from second word
              while (nextIndex === secondIndexRef.current && words.length > 1) {
                nextIndex = (nextIndex + 1) % words.length
              }
              return nextIndex
            })
          } else {
            setSecondIndex((prevIndex) => {
              let nextIndex = (prevIndex + 1) % words.length
              // Ensure it's different from first word
              while (nextIndex === firstIndexRef.current && words.length > 1) {
                nextIndex = (nextIndex + 1) % words.length
              }
              return nextIndex
            })
          }
        }, 300) // Half of animation duration (0.6s / 2)
        
        return willAnimateFirst
      })
    }, interval)

    return () => {
      clearTimeout(timer)
      if (changeTimer) clearTimeout(changeTimer)
    }
  }, [isAnimatingFirst, words.length, interval])

  if (words.length === 0) return null

  return (
    <span className={cn("font-semibold", className)}>
      <span className="inline-block">
        <span 
          key={isAnimatingFirst ? `first-${firstIndex}-${animationKey}` : `first-static-${firstIndex}`}
          className={cn(
            "inline-block",
            isAnimatingFirst && "animate-flip"
          )}
          style={{
            animationDuration: '0.6s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {words[firstIndex]}
        </span>
      </span>
      <span className="mx-1">+</span>
      <span className="inline-block">
        <span 
          key={!isAnimatingFirst ? `second-${secondIndex}-${animationKey}` : `second-static-${secondIndex}`}
          className={cn(
            "inline-block",
            !isAnimatingFirst && "animate-flip"
          )}
          style={{
            animationDuration: '0.6s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {words[secondIndex]}
        </span>
      </span>
    </span>
  )
}
