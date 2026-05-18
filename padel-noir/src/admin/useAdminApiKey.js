import { useCallback, useState } from 'react'

const STORAGE_KEY = 'padel-pro-admin-api-key'

export function useAdminApiKey() {
  const [adminKey, setAdminKey] = useState(
    () => import.meta.env.VITE_ADMIN_API_KEY || sessionStorage.getItem(STORAGE_KEY) || '',
  )

  const saveAdminKey = useCallback((key) => {
    const trimmed = String(key).trim()
    if (!trimmed) return
    sessionStorage.setItem(STORAGE_KEY, trimmed)
    setAdminKey(trimmed)
  }, [])

  const clearAdminKey = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAdminKey(import.meta.env.VITE_ADMIN_API_KEY || '')
  }, [])

  const hasBuiltInKey = Boolean(import.meta.env.VITE_ADMIN_API_KEY)

  return { adminKey, saveAdminKey, clearAdminKey, hasBuiltInKey }
}
