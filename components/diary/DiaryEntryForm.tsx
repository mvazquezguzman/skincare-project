"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiaryEntryFormData, SkinFeel } from "@/lib/diary-types"
import { format } from "date-fns"
import { StarIcon } from "@heroicons/react/24/solid"
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline"

interface DiaryEntryFormProps {
  initialData?: DiaryEntryFormData
  selectedDate: Date
  onSubmit: (data: DiaryEntryFormData) => Promise<void>
  isSubmitting?: boolean
  showCard?: boolean
}

const skinFeelOptions: { value: SkinFeel; label: string; emoji: string }[] = [
  { value: "normal", label: "Normal", emoji: "✨" },
  { value: "dry", label: "Dry", emoji: "🏜️" },
  { value: "oily", label: "Oily", emoji: "💧" },
  { value: "balanced", label: "Balanced", emoji: "⚖️" },
  { value: "sensitive", label: "Sensitive", emoji: "🌿" },
  { value: "irritated", label: "Irritated", emoji: "😣" },
  { value: "acne", label: "Acne", emoji: "🔴" },
  { value: "combination", label: "Combination", emoji: "🔄" },
]

export function DiaryEntryForm({
  initialData,
  selectedDate,
  onSubmit,
  isSubmitting = false,
  showCard = true,
}: DiaryEntryFormProps) {
  const [skinFeel, setSkinFeel] = useState<SkinFeel>(
    initialData?.skin_feel || "normal"
  )
  const [rating, setRating] = useState<number>(
    initialData?.skin_condition_rating || 3
  )
  const [notes, setNotes] = useState<string>(initialData?.notes || "")
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || "")
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Entry name is always the formatted date
    const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy")

    const formData: DiaryEntryFormData = {
      entry_date: format(selectedDate, "yyyy-MM-dd"),
      entry_name: formattedDate,
      skin_feel: skinFeel,
      skin_condition_rating: rating,
      notes: notes.trim() || undefined,
      image_url: imageUrl || undefined,
    }

    await onSubmit(formData)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImageUrl(result)
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageUrl("")
    setImagePreview(null)
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skin Feel */}
          <div className="space-y-3">
            <Label className="font-open-sans text-base">How does your skin feel today?</Label>
            <RadioGroup
              value={skinFeel}
              onValueChange={(value) => setSkinFeel(value as SkinFeel)}
              className="grid grid-cols-2 gap-3"
            >
              {skinFeelOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent cursor-pointer"
                  onClick={() => setSkinFeel(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="font-open-sans cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="font-open-sans text-base">Overall skin condition rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label={`Rate ${star} out of 5`}
                >
                  {star <= rating ? (
                    <StarIcon className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground font-open-sans">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="font-open-sans text-base">Upload Photo (optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-12 h-12 text-muted-foreground mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground font-open-sans">Click to upload a photo</span>
                  <span className="text-xs text-muted-foreground/70 font-open-sans mt-1">Max 5MB</span>
                </label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-open-sans text-base">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about your skin today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="font-open-sans"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-open-sans"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update Entry" : "Save Entry"}
          </Button>
        </form>
  )

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <h2 className="font-montserrat text-xl font-semibold mb-6"> {format(selectedDate, "EEEE, MMMM d, yyyy")} </h2>
      {formContent}
    </div>
  )
}
