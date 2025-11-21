import { UserProfile } from "@/lib/profile-types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatBudgetRange } from "@/lib/profile-utils"

interface ProfileSummaryProps {
  profile: UserProfile
}

const getBudgetLabel = (budgetRange: string): string => {
  const labelMap: Record<string, string> = {
    budget: 'Budget-Friendly',
    moderate: 'Moderate',
    premium: 'Premium',
    luxury: 'Luxury',
    flexible: 'Flexible'
  }
  return labelMap[budgetRange] || budgetRange.charAt(0).toUpperCase() + budgetRange.slice(1)
}

export default function ProfileSummary({ profile }: ProfileSummaryProps) {
  const firstName = profile.name.split(' ')[0]
  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold mb-6 text-foreground">{firstName}&rsquo;s Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Skin Concerns</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skinConcerns.length > 0 ? (
                profile.skinConcerns.map((concern, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {concern}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None specified</span>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Separator orientation="vertical" className="hidden md:block absolute left-0 top-0 bottom-0" />
            <div className="space-y-3 md:pl-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Allergies/Avoids</h4>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None specified</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Separator orientation="vertical" className="hidden md:block absolute left-0 top-0 bottom-0" />
            <div className="space-y-3 md:pl-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Budget Range</h4>
              <div className="space-y-2">
                {profile.budgetRange ? (
                  <>
                    <Badge variant="default" className="text-sm py-1 px-3">
                      {getBudgetLabel(profile.budgetRange)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatBudgetRange(profile.budgetRange)}
                    </p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}
