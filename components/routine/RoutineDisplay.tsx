import { RoutineStep } from "@/lib/profile-types"
import { getCategoryOrder } from "@/lib/profile-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoutineStepCard from "./RoutineStepCard"

interface RoutineDisplayProps {
  generatedRoutine: {
    morning: RoutineStep[]
    evening: RoutineStep[]
  }
  activeTab: "morning" | "evening"
  onTabChange: (tab: "morning" | "evening") => void
  onGenerate: () => void
  onSave: () => void
  isGenerating: boolean
  isSaving: boolean
  onRemoveProduct?: (stepId: string, productId: string, timeOfDay: "morning" | "evening") => void
  onRegenerateStep?: (stepId: string, timeOfDay: "morning" | "evening") => void
  onSelectProduct?: (stepId: string, productId: string, timeOfDay: "morning" | "evening") => void
  regeneratingStepId?: string | null
}

const getCategoryPriority = (
  category: RoutineStep["category"],
  timeOfDay: "morning" | "evening"
) => {
  if (timeOfDay === "evening" && category === "makeup-remover") {
    return -1
  }
  return getCategoryOrder(category)
}

// Sort steps by step number for continuous horizontal display
const sortedSteps = (steps: RoutineStep[], timeOfDay: "morning" | "evening") => {
  return [...steps].sort((a, b) => {
    const categoryOrderA = getCategoryPriority(a.category, timeOfDay)
    const categoryOrderB = getCategoryPriority(b.category, timeOfDay)

    if (categoryOrderA !== categoryOrderB) {
      return categoryOrderA - categoryOrderB
    }

    const stepA = (a.step ?? categoryOrderA)
    const stepB = (b.step ?? categoryOrderB)
    return stepA - stepB
  })
}

export default function RoutineDisplay({
  generatedRoutine,
  activeTab,
  onTabChange,
  onGenerate,
  onSave,
  isGenerating,
  isSaving,
  onRemoveProduct,
  onRegenerateStep,
  onSelectProduct,
  regeneratingStepId
}: RoutineDisplayProps) {
  const currentSteps = generatedRoutine[activeTab]
  const sorted = sortedSteps(currentSteps, activeTab)

  const handleRemoveProduct = (stepId: string, productId: string) => {
    if (onRemoveProduct) {
      onRemoveProduct(stepId, productId, activeTab)
    }
  }

  const handleRegenerateStep = (stepId: string) => {
    if (onRegenerateStep) {
      onRegenerateStep(stepId, activeTab)
    }
  }

  const handleSelectProduct = (stepId: string, productId: string) => {
    if (onSelectProduct) {
      onSelectProduct(stepId, productId, activeTab)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-montserrat font-black text-3xl">Generated Routine</h2>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save to Profile"}
          </Button>
        </div>
      </div>

      {/* Routine Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="morning" className="flex items-center gap-2">
            ☀️
            Day Routine
          </TabsTrigger>
          <TabsTrigger value="evening" className="flex items-center gap-2">
            🌙
            Night Routine
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-lg mb-6 text-center">
                    No {activeTab === "morning" ? "day" : "night"} routine generated yet
                  </p>
                  <Button onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Routine"}
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Vertical rectangular list stacked in order */}
                  <div className="space-y-6">
                    {sorted.map((step) => (
                      <RoutineStepCard 
                        key={step.id} 
                        step={step}
                        onRemoveProduct={handleRemoveProduct}
                        onRegenerateStep={handleRegenerateStep}
                        onSelectProduct={handleSelectProduct}
                        isRegenerating={regeneratingStepId === step.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
