"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DiaryEntry } from "@/lib/diary-types"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"

interface DiaryEntryModalProps {
  entry: DiaryEntry | null
  isOpen: boolean
  onClose: () => void
  onDelete: (entryId: string) => Promise<void>
  onEdit: () => void
}

export function DiaryEntryModal({
  entry,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: DiaryEntryModalProps) {
  if (!entry) return null

  const skinFeelLabels: Record<string, string> = {
    dry: "Dry",
    oily: "Oily",
    balanced: "Balanced",
    sensitive: "Sensitive",
    irritated: "Irritated",
    combination: "Combination",
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await onDelete(entry.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-open-sans">
        <DialogHeader>
          <DialogTitle className="font-montserrat"> {format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")} </DialogTitle>
          <DialogDescription>View and manage your diary entry</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {entry.image_url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Photo</p>
              <img
                src={entry.image_url}
                alt="Diary entry photo"
                className="w-full h-64 object-cover rounded-md border"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Skin Feel</p>
            <p className="text-base">{skinFeelLabels[entry.skin_feel] || entry.skin_feel}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rating</p>
            <p className="text-base">{entry.skin_condition_rating}/5</p>
          </div>
          {entry.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-base whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={onEdit} className="flex-1">Edit Entry</Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
