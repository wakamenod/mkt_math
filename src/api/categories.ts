import { supabase } from '../lib/supabase'
import type { Category } from '../types/domain'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function createCategory(input: { name: string; sort_order: number }) {
  const { error } = await supabase.from('categories').insert(input)
  if (error) throw error
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  const { error } = await supabase.from('categories').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
