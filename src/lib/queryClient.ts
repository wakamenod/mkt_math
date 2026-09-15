import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

/** クエリキーの単一定義。invalidate 漏れを防ぐためここ以外に文字列を書かない。 */
export const qk = {
  categories: ['categories'] as const,
  exerciseSets: ['exercise_sets'] as const,
  sessions: ['sessions'] as const,
}
