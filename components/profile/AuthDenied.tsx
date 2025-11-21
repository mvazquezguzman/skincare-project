import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthDenied() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="font-montserrat font-bold text-2xl text-foreground mb-4">Access Denied</h1>
          <p className="font-open-sans text-muted-foreground mb-6">You need to be logged in to view your routine.</p>
          
          <div className="space-x-4">
            <Button asChild><Link href="/auth/signin">Sign In</Link></Button>
            <Button asChild variant="outline"><Link href="/auth/signup">Create Account</Link></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
