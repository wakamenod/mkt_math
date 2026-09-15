import { useQuery } from '@tanstack/react-query'
import { qk } from '../lib/queryClient'
import { fetchCategories } from '../api/categories'
import { fetchExerciseSets } from '../api/exerciseSets'
import { fetchAllSessions } from '../api/sessions'

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: fetchCategories })
}

export function useExerciseSets() {
  return useQuery({ queryKey: qk.exerciseSets, queryFn: fetchExerciseSets })
}

export function useSessions() {
  return useQuery({ queryKey: qk.sessions, queryFn: fetchAllSessions })
}
