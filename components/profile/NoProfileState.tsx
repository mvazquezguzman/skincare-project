import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

export default function NoProfileState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-montserrat font-black text-4xl text-foreground mb-4">Create Your Skincare Routine</h1>
          <p className="font-open-sans text-lg text-muted-foreground mb-8">Start building your personalized skincare routine to achieve your skin goals.</p>
        </div>
        
        <Button asChild size="lg" className="font-open-sans font-medium"><Link href="/skin-routine">Complete Your Profile First</Link></Button>
      </div>
    </div>
  )
}
