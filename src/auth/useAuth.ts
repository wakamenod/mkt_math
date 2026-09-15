import { useContext } from 'react'
import { AuthContext, type AuthValue } from './AuthProvider'

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider の内側で使ってください')
  return ctx
}
