"use client"

import { DiaryEntry } from "@/lib/diary-types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DiaryEntriesTableProps {
  entries: DiaryEntry[]
  onEntryClick: (entry: DiaryEntry) => void
}

// Skin condition labels and colors
const skinConfig: Record<string, { label: string; className: string }> = {
  normal: {
    label: "Normal",
    className: "bg-pink-100 text-pink-700 border-pink-200",
  },
  irritated: {
    label: "Irritated",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  acne: {
    label: "Acne",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  dry: {
    label: "Dry",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  oily: {
    label: "Oily",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  balanced: {
    label: "Balanced",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  sensitive: {
    label: "Sensitive",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  combination: {
    label: "Combination",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
}

export function DiaryEntriesTable({
  entries,
  onEntryClick,
}: DiaryEntriesTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-open-sans text-muted-foreground">No entries yet. Create your first entry to get started!</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left p-4 font-montserrat font-semibold text-sm">Date</th>
            <th className="text-left p-4 font-montserrat font-semibold text-sm">Skin Condition</th>
            <th className="text-left p-4 font-montserrat font-semibold text-sm">Rating</th>
            <th className="text-left p-4 font-montserrat font-semibold text-sm">Notes</th>
           </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const skinInfo = skinConfig[entry.skin_feel] || {
              label: entry.skin_feel,
              className: "bg-gray-100 text-gray-700 border-gray-200",
            }

            return (
              <tr
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <td className="p-4">
                  <p className="font-open-sans text-sm font-medium">
                    {entry.entry_name || format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")}
                  </p>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-open-sans", skinInfo.className)}
                  >
                    {skinInfo.label}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <span className="font-open-sans text-sm font-semibold">
                      {entry.skin_condition_rating}
                    </span>
                    <span className="font-open-sans text-sm text-muted-foreground">/5</span>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-open-sans text-sm text-muted-foreground">
                    {entry.notes || "-"}
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
