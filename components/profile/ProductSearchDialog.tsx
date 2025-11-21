"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import { RoutineStep } from "@/lib/profile-types"

interface Product {
  id: string
  productBrand: string
  productName: string
  price: number
  description: string | null
  imgURL: string | null
  productURL: string | null
  categoryName: string | null
  ingredients?: string[] | null
}

interface ProductSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProduct: (product: Product, category: RoutineStep["category"], timeOfDay: "morning" | "evening") => void
  onSkip?: (category: RoutineStep["category"], timeOfDay: "morning" | "evening") => void
  timeOfDay: "morning" | "evening"
  selectedCategory?: RoutineStep["category"] | null
}

// Map database category names to RoutineStep categories
const mapCategoryToRoutineCategory = (categoryName: string | null): RoutineStep["category"] | null => {
  if (!categoryName) return null
  
  const categoryLower = categoryName.toLowerCase()
  
  // Cleansers
  if (categoryLower.includes("cleanser") || categoryLower.includes("face wash") || categoryLower.includes("cleansing")) {
    return "cleanser"
  }
  
  // Toners
  if (categoryLower.includes("toner") || categoryLower.includes("essence")) {
    return "toner"
  }
  
  // Serums
  if (categoryLower.includes("serum") || categoryLower.includes("treatment serum")) {
    return "serum"
  }
  
  // Moisturizers
  if (categoryLower.includes("moisturizer") || categoryLower.includes("cream") || categoryLower.includes("lotion")) {
    return "moisturizer"
  }
  
  // Sunscreen
  if (categoryLower.includes("sunscreen") || categoryLower.includes("spf") || categoryLower.includes("sun protection")) {
    return "sunscreen"
  }
  
  // Eye Cream
  if (categoryLower.includes("eye") && (categoryLower.includes("cream") || categoryLower.includes("serum") || categoryLower.includes("treatment"))) {
    return "eye-cream"
  }
  
  // Exfoliants
  if (categoryLower.includes("exfoliant") || categoryLower.includes("peel") || categoryLower.includes("scrub") || categoryLower.includes("aha") || categoryLower.includes("bha")) {
    return "exfoliant"
  }
  
  // Retinoids
  if (categoryLower.includes("retinol") || categoryLower.includes("retinoid") || categoryLower.includes("retin-a")) {
    return "retinoid"
  }
  
  // Masks
  if (categoryLower.includes("mask")) {
    return "mask"
  }
  
  // Treatment (catch-all for other treatments)
  if (categoryLower.includes("treatment") || categoryLower.includes("spot treatment")) {
    return "treatment"
  }
  
  return null
}

export default function ProductSearchDialog({
  open,
  onOpenChange,
  onSelectProduct,
  onSkip,
  timeOfDay,
  selectedCategory: propSelectedCategory
}: ProductSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch products from database
  useEffect(() => {
    if (!open) return

    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Fetch all products in batches to avoid timeout
        let allProducts: Product[] = []
        let from = 0
        const batchSize = 1000
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from('all_products')
            .select('id, productBrand, productName, price, description, imgURL, productURL, categoryName, ingredients')
            .order('created_at', { ascending: false })
            .range(from, from + batchSize - 1)
          
          if (error) throw error
          
          if (data && data.length > 0) {
            allProducts = [...allProducts, ...(data as Product[])]
            from += batchSize
            hasMore = data.length === batchSize
          } else {
            hasMore = false
          }
        }
        
        setProducts(allProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [open])

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products // Show all products if no search
    
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.productName.toLowerCase().includes(query) ||
      product.productBrand.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    )
  }, [products, searchQuery])

  const handleProductSelect = (product: Product) => {
    // Use provided category if available, otherwise auto-detect from product
    const category = propSelectedCategory || mapCategoryToRoutineCategory(product.categoryName) || "treatment"
    
    onSelectProduct(product, category, timeOfDay)
    onOpenChange(false)
    setSearchQuery("")
  }

  const handleSkip = () => {
    if (onSkip && propSelectedCategory) {
      onSkip(propSelectedCategory, timeOfDay)
    }
    onOpenChange(false)
    setSearchQuery("")
  }

  // Helper to get key ingredient from product
  const getKeyIngredient = (product: Product): string | null => {
    if (!product.ingredients || product.ingredients.length === 0) return null
    
    // Parse ingredients if it's a string
    let ingredients: string[] = []
    if (Array.isArray(product.ingredients)) {
      ingredients = product.ingredients
    } else if (typeof product.ingredients === 'string') {
      try {
        const parsed = JSON.parse(product.ingredients)
        ingredients = Array.isArray(parsed) ? parsed : []
      } catch {
        ingredients = []
      }
    }
    
    // Return first ingredient if available
    return ingredients.length > 0 ? ingredients[0] : null
  }

  // Helper to get category display name
  const getCategoryDisplayName = (category: RoutineStep["category"] | null): string => {
    if (!category) return "Product"
    const displayNames: Record<string, string> = {
      "cleanser": "Cleanser",
      "toner": "Toner",
      "serum": "Serum",
      "moisturizer": "Moisturizer",
      "sunscreen": "SPF",
      "eye-cream": "Eye Cream",
      "exfoliant": "Exfoliant",
      "retinoid": "Retinoid",
      "mask": "Mask",
      "treatment": "Treatment"
    }
    return displayNames[category] || category
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Product to {timeOfDay === "morning" ? "Morning" : "Evening"} Routine</DialogTitle>
          <DialogDescription>
            Search for products from the database to add to your routine
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No products found" : "Start typing to search for products"}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredProducts.map((product) => {
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="relative bg-white border rounded-lg p-4 hover:shadow-md transition-all text-left w-full flex gap-4 items-center"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {product.imgURL ? (
                          <img
                            src={product.imgURL}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {/* Brand Name */}
                        {product.productBrand && (
                          <p className="text-sm text-gray-500 mb-1">
                            {product.productBrand}
                          </p>
                        )}
                        
                        {/* Product Name */}
                        <h3 className="font-semibold text-base text-gray-900 line-clamp-2">
                          {product.productName}
                        </h3>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Skip Button */}
          {onSkip && propSelectedCategory && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full"
              >
                Skip - I don&rsquo;t have this product
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

