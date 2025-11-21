import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { RoutineStep } from "@/lib/profile-types"
import { getCategoryDisplayName } from "@/lib/routine-utils"

interface RoutineStepCardProps {
  step: RoutineStep
  stepNumber: number
  isFavorite: boolean
  onToggleFavorite: () => void
  onRemove?: () => void
  isEditing?: boolean
}

export default function RoutineStepCard({ step, stepNumber, isFavorite, onToggleFavorite, onRemove, isEditing }: RoutineStepCardProps) {
  // Extract just ingredient names (first word before colon or comma) for compact display
  const getCompactIngredients = (ingredients?: string[]): string => {
    if (!ingredients || ingredients.length === 0) return ""
    const firstIngredient = ingredients[0]
    // Extract just the ingredient name (before colon, comma, or dash)
    const name = firstIngredient.split(/[:,\-]/)[0].trim()
    return name
  }

  return (
    <Card className="relative border border-gray-200 rounded-lg bg-white hover:shadow-sm hover:border-gray-300 transition-all">
      <CardContent className="p-4">
        {/* Clean layout with product image */}
        <div className="flex items-center gap-4">
          {/* Product Image */}
          {step.imageUrl ? (
            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              <img
                src={step.imageUrl}
                alt={step.productName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{stepNumber}</span>
              </div>
            </div>
          )}
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Brand Name */}
            {step.brand && (
              <p className="text-sm text-gray-500 mb-0.5">
                {step.brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-semibold text-base text-gray-900 leading-tight mb-1">
              {step.productName}
            </h3>
            
            {/* Category and Frequency */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {getCategoryDisplayName(step.category)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 capitalize">
                {step.frequency || "daily"}
              </span>
            </div>
          </div>
          
          {/* Remove Button - Only show when editing */}
          {isEditing && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
              title="Remove product"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
