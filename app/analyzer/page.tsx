"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConflictAnalyzer, type UserRoutineProduct, type RoutineAnalysis } from "@/lib/conflict-analyzer"

export default function AnalyzerPage() {
  const [products, setProducts] = useState<UserRoutineProduct[]>([])
  const [analysis, setAnalysis] = useState<RoutineAnalysis | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<UserRoutineProduct>>({
    name: "",
    brand: "",
    category: "cleanser",
    step: 1,
    timing: "Both",
    ingredients: [],
    frequency: "daily",
  })

  const categories = [
    { value: "cleanser", label: "Cleanser" },
    { value: "toner", label: "Toner" },
    { value: "serum", label: "Serum" },
    { value: "treatment", label: "Treatment" },
    { value: "moisturizer", label: "Moisturizer" },
    { value: "sunscreen", label: "Sunscreen" },
    { value: "mask", label: "Mask" },
    { value: "oil", label: "Face Oil" },
  ]

  const addProduct = () => {
    if (!newProduct.name || !newProduct.brand || !newProduct.ingredients?.length) return

    const product: UserRoutineProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category || "cleanser",
      step: newProduct.step || 1,
      timing: newProduct.timing || "Both",
      ingredients: newProduct.ingredients || [],
      frequency: newProduct.frequency || "daily",
    }

    setProducts((prev) => [...prev, product])
    setShowAddProduct(false)
    resetNewProduct()
  }

  const resetNewProduct = () => {
    setNewProduct({
      name: "",
      brand: "",
      category: "cleanser",
      step: 1,
      timing: "Both",
      ingredients: [],
      frequency: "daily",
    })
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const analyzeRoutine = () => {
    if (products.length === 0) return
    const result = ConflictAnalyzer.analyzeRoutine(products)
    setAnalysis(result)
  }

  const addIngredient = (ingredient: string) => {
    if (!ingredient.trim()) return
    setNewProduct((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ingredient.trim()],
    }))
  }

  const removeIngredient = (index: number) => {
    setNewProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || [],
    }))
  }

  const loadSampleRoutine = () => {
    const sampleProducts: UserRoutineProduct[] = [
      {
        id: "1",
        name: "Foaming Cleanser",
        brand: "CeraVe",
        category: "cleanser",
        step: 1,
        timing: "Both",
        ingredients: ["Ceramides", "Niacinamide"],
        frequency: "daily",
      },
      {
        id: "2",
        name: "2% BHA Liquid Exfoliant",
        brand: "Paula's Choice",
        category: "treatment",
        step: 2,
        timing: "AM",
        ingredients: ["Salicylic Acid"],
        frequency: "daily",
      },
      {
        id: "3",
        name: "C E Ferulic",
        brand: "SkinCeuticals",
        category: "serum",
        step: 3,
        timing: "AM",
        ingredients: ["Vitamin C", "Vitamin E"],
        frequency: "daily",
      },
      {
        id: "4",
        name: "Retinol 0.5%",
        brand: "The Ordinary",
        category: "serum",
        step: 3,
        timing: "PM",
        ingredients: ["Retinol"],
        frequency: "daily",
      },
      {
        id: "5",
        name: "Daily Moisturizer",
        brand: "Cetaphil",
        category: "moisturizer",
        step: 4,
        timing: "Both",
        ingredients: ["Hyaluronic Acid", "Ceramides"],
        frequency: "daily",
      },
    ]
    setProducts(sampleProducts)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Routine Analyzer</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSampleRoutine}>
                Load Sample
              </Button>
              <Button onClick={() => setShowAddProduct(true)}>Add Product</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Analyze Your Current Routine</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Add your current skincare products to identify potential conflicts, timing issues, and get personalized
              improvement suggestions.
            </p>
          </div>

          {/* Current Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Current Routine</CardTitle>
                  <CardDescription>
                    {products.length} product{products.length !== 1 ? "s" : ""} added
                  </CardDescription>
                </div>
                {products.length > 0 && (
                  <Button onClick={analyzeRoutine} size="lg">
                    Analyze Routine
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No products added yet. Start by adding your products.</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowAddProduct(true)}>Add First Product</Button>
                    <Button variant="outline" onClick={loadSampleRoutine}>
                      Try Sample Routine
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {products
                    .sort((a, b) => a.step - b.step)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Step {product.step}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {product.timing}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.frequency}
                            </Badge>
                          </div>
                          <h4 className="font-medium">
                            {product.brand} {product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.ingredients.map((ingredient, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Routine Analysis Score</CardTitle>
                    <CardDescription>Overall assessment of your skincare routine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold mb-2 ${ConflictAnalyzer.getScoreColor(analysis.overallScore)}`}
                      >
                        {analysis.overallScore}
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">
                        {ConflictAnalyzer.getScoreDescription(analysis.overallScore)}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{analysis.conflicts.length}</div>
                          <p className="text-sm text-muted-foreground">Conflicts Found</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{analysis.improvements.length}</div>
                          <p className="text-sm text-muted-foreground">Improvements Suggested</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{analysis.strengths.length}</div>
                          <p className="text-sm text-muted-foreground">Routine Strengths</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.conflicts.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-600">Priority Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.conflicts.slice(0, 3).map((conflict, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{conflict.title}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysis.strengths.length > 0 && (
                    <Card className="border-green-200">
                      <CardHeader>
                        <CardTitle className="text-green-600">What's Working Well</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.strengths.slice(0, 3).map((strength, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="conflicts" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Ingredient Conflicts & Issues</h3>
                  {analysis.conflicts.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No conflicts detected in your routine! 🎉</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {analysis.conflicts.map((conflict, idx) => (
                        <Alert key={idx} className={ConflictAnalyzer.getConflictSeverityColor(conflict.severity)}>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{conflict.title}</h4>
                              <Badge
                                variant={
                                  conflict.severity === "high"
                                    ? "destructive"
                                    : conflict.severity === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {conflict.severity}
                              </Badge>
                            </div>
                            <AlertDescription>{conflict.description}</AlertDescription>
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-1">Affected Products:</p>
                              <div className="flex flex-wrap gap-1">
                                {conflict.affectedProducts.map((product, productIdx) => (
                                  <Badge key={productIdx} variant="outline" className="text-xs">
                                    {product}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-white/50 rounded-md">
                              <p className="text-sm font-medium mb-1">Solution:</p>
                              <p className="text-sm">{conflict.solution}</p>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Suggested Improvements</h3>
                  {analysis.improvements.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">Your routine looks great! No major improvements needed.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {analysis.improvements.map((improvement, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{improvement.title}</CardTitle>
                              <Badge
                                variant={
                                  improvement.severity === "high"
                                    ? "destructive"
                                    : improvement.severity === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {improvement.severity}
                              </Badge>
                            </div>
                            <CardDescription>{improvement.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {improvement.affectedProducts.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Affected Products:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {improvement.affectedProducts.map((product, productIdx) => (
                                      <Badge key={productIdx} variant="outline" className="text-xs">
                                        {product}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm font-medium mb-1">Recommendation:</p>
                                <p className="text-sm">{improvement.solution}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Routine Strengths</h3>
                  {analysis.strengths.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">
                          Add more products to your routine to identify strengths.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.strengths.map((strength, idx) => (
                        <Card key={idx} className="border-green-200 bg-green-50">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">✓</span>
                              <p className="font-medium text-green-800">{strength}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Add Product Modal */}
          {showAddProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Add Product to Routine</CardTitle>
                  <CardDescription>Enter details about a product in your current routine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        placeholder="e.g., Foaming Cleanser"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="e.g., CeraVe"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, brand: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>When do you use it?</Label>
                      <Select
                        value={newProduct.timing}
                        onValueChange={(value: any) => setNewProduct((prev) => ({ ...prev, timing: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">Morning only</SelectItem>
                          <SelectItem value="PM">Evening only</SelectItem>
                          <SelectItem value="Both">Both AM & PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={newProduct.frequency}
                        onValueChange={(value: any) => setNewProduct((prev) => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="alternate">Every other day</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Ingredients</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add ingredient (e.g., Salicylic Acid)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addIngredient(e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newProduct.ingredients?.map((ingredient, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeIngredient(idx)}
                        >
                          {ingredient} ×
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter to add ingredients. Click on ingredients to remove them.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={addProduct}
                      disabled={!newProduct.name || !newProduct.brand || !newProduct.ingredients?.length}
                    >
                      Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
