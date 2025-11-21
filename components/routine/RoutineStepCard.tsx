import { RoutineStep } from "@/lib/profile-types"
import { getCategoryDisplayName, getCategoryTagColor } from "@/lib/routine-utils"
import { Button } from "@/components/ui/button"
import { X, RefreshCw, Check } from "lucide-react"

interface RoutineStepCardProps {
  step: RoutineStep
  onRemoveProduct?: (stepId: string, productId: string) => void
  onRegenerateStep?: (stepId: string) => void
  onSelectProduct?: (stepId: string, productId: string) => void
  isRegenerating?: boolean
}

export default function RoutineStepCard({ 
  step, 
  onRemoveProduct, 
  onRegenerateStep,
  onSelectProduct,
  isRegenerating = false 
}: RoutineStepCardProps) {
  // Get products array if available, otherwise use legacy single product
  const products = (step as any).products || []
  const hasMultipleProducts = products.length > 0
  
  // If no products array, create a single product from legacy fields
  const displayProducts = hasMultipleProducts ? products : [{
    id: step.id,
    productName: step.productName,
    brand: step.brand,
    price: step.price,
    imageUrl: step.imageUrl,
    productURL: step.productURL,
    description: step.description,
    ingredients: step.ingredients
  }]

  const getProductIdentifier = (product: any) => {
    // Try to get ID first
    if (product.id) return product.id
    // Fall back to brand + name combination
    if (product.brand && product.productName) {
      return `${product.brand}-${product.productName}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .trim()
    }
    return product.productName || ''
  }

  // Determine which product is selected (first product is the primary/selected one)
  const selectedProductId = displayProducts.length > 0 ? getProductIdentifier(displayProducts[0]) : null

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        {/* Category Tag and Regenerate Button */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-block px-3 py-1.5 ${getCategoryTagColor(step.category)} text-xs font-semibold rounded`}>
            {getCategoryDisplayName(step.category)}
          </span>
          {onRegenerateStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateStep(step.id)}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>

        {/* Purpose/Instruction (Step Notes) */}
        {step.notes && (
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            {step.notes}
          </p>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {displayProducts.map((product: any, index: number) => {
            const productId = getProductIdentifier(product)
            const isSelected = productId === selectedProductId
            
            return (
              <div 
                key={index} 
                className={`flex gap-4 p-4 border rounded-lg transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl || '/placeholder.jpg'}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 flex flex-col">
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                        <Check className="h-3 w-3" />
                        Selected
                      </span>
                    </div>
                  )}
                  
                  {/* Brand Name */}
                  {product.brand && (
                    <p className="text-sm font-medium text-gray-800 mb-1">{product.brand}</p>
                  )}
                  {/* Product Name */}
                  <h3 className="font-semibold text-base text-gray-900 leading-tight mb-2">
                    {product.productName}
                  </h3>
                  {/* Product Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {/* Price */}
                  {product.price && (
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                  {/* Frequency - only show on first product */}
                  {index === 0 && (
                    <div className="mt-auto">
                      <span className="text-sm text-gray-500 capitalize font-medium">{step.frequency || "daily"}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Select Button - show if not selected and there are multiple products */}
                  {onSelectProduct && displayProducts.length > 1 && !isSelected && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSelectProduct(step.id, productId)}
                      className="flex items-center gap-2"
                      title="Select this product"
                    >
                      <Check className="h-4 w-4" />
                      Select
                    </Button>
                  )}
                  
                  {/* Remove Button - show if there are multiple products */}
                  {onRemoveProduct && displayProducts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveProduct(step.id, productId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remove this product"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
