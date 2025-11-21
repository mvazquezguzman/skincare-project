import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RoutineGeneratorButtonProps {
  onGenerate: () => void
  isGenerating: boolean
  error: string | null
}

export default function RoutineGeneratorButton({ 
  onGenerate, 
  isGenerating, 
  error 
}: RoutineGeneratorButtonProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground mb-6">Click the button below to generate your personalized skincare routine.</p>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          size="lg"
          className="min-w-[200px]"
        >
          {isGenerating ? "Generating..." : "Generate Routine"}
        </Button>
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
