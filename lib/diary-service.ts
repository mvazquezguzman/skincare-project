import { supabase } from '@/lib/supabase'
import { DiaryEntry, DiaryEntryFormData } from './diary-types'

export async function getDiaryEntries(userId: string, month?: Date): Promise<DiaryEntry[]> {
  try {
    let query = supabase
      .from('user_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (month) {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      query = query
        .gte('entry_date', startOfMonth.toISOString().split('T')[0])
        .lte('entry_date', endOfMonth.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching diary entries:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getDiaryEntries:', error)
    throw error
  }
}

export async function getDiaryEntryByDate(userId: string, date: string): Promise<DiaryEntry | null> {
  try {
    const { data, error } = await supabase
      .from('user_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No entry found
        return null
      }
      console.error('Error fetching diary entry:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getDiaryEntryByDate:', error)
    throw error
  }
}

export async function createDiaryEntry(userId: string, entry: DiaryEntryFormData): Promise<DiaryEntry> {
  try {
      const { data, error } = await supabase
      .from('user_diary_entries')
      .insert({
        user_id: userId,
        entry_date: entry.entry_date,
        entry_name: entry.entry_name || null,
        skin_feel: entry.skin_feel,
        skin_condition_rating: entry.skin_condition_rating,
        notes: entry.notes || null,
        image_url: entry.image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating diary entry:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createDiaryEntry:', error)
    throw error
  }
}

export async function updateDiaryEntry(entryId: string, entry: Partial<DiaryEntryFormData>): Promise<DiaryEntry> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (entry.entry_name !== undefined) updateData.entry_name = entry.entry_name || null
    if (entry.skin_feel !== undefined) updateData.skin_feel = entry.skin_feel
    if (entry.skin_condition_rating !== undefined) updateData.skin_condition_rating = entry.skin_condition_rating
    if (entry.notes !== undefined) updateData.notes = entry.notes || null
    if (entry.image_url !== undefined) updateData.image_url = entry.image_url || null

    const { data, error } = await supabase
      .from('user_diary_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating diary entry:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateDiaryEntry:', error)
    throw error
  }
}

export async function deleteDiaryEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_diary_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('Error deleting diary entry:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteDiaryEntry:', error)
    throw error
  }
}
