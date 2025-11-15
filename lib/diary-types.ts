export type SkinFeel = 'dry' | 'oily' | 'balanced' | 'sensitive' | 'irritated' | 'combination' | 'normal' | 'acne'
export type EntryType = 'reaction_to_ingredient' | 'new_skin_care' | 'product' | 'skin_condition' | null

export interface DiaryEntry {
  id: string
  user_id: string
  entry_date: string
  entry_name?: string | null
  entry_type?: EntryType
  skin_feel: SkinFeel
  skin_condition_rating: number
  notes?: string | null
  products_used?: string[] | null
  concerns_noted?: string[] | null
  mood?: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
}

export interface DiaryEntryFormData {
  entry_date: string
  entry_name?: string
  skin_feel: SkinFeel
  skin_condition_rating: number
  notes?: string
  image_url?: string
}
