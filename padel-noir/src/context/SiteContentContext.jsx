import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SITE_CONTENT, STORAGE_KEY } from '../content/defaultSiteContent'
import { deepMerge, getAt, setAt } from '../utils/siteContentUtils'

const SiteContentContext = createContext(null)

function migrateCourts(content) {
  const cards = content?.sections?.courts?.cards
  const legacyNames = new Set(['COURT NOIR', 'COURT BLEU', 'COURT AMBER', 'COURT ELITE'])
  const needsCourts =
    !Array.isArray(cards) ||
    cards.length !== 2 ||
    cards.some((c) => legacyNames.has(c?.name))
  if (!needsCourts) return content

  const next = structuredClone(content)
  next.sections.courts.cards = structuredClone(DEFAULT_SITE_CONTENT.sections.courts.cards)
  next.sections.courts.stripCaption = DEFAULT_SITE_CONTENT.sections.courts.stripCaption
  next.pageHero.courts.subtitle = DEFAULT_SITE_CONTENT.pageHero.courts.subtitle
  next.sections.modal.courts = structuredClone(DEFAULT_SITE_CONTENT.sections.modal.courts)
  return next
}

function loadMerged() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_SITE_CONTENT)
    const parsed = JSON.parse(raw)
    return migrateCourts(deepMerge(DEFAULT_SITE_CONTENT, parsed))
  } catch {
    return structuredClone(DEFAULT_SITE_CONTENT)
  }
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(loadMerged)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
    } catch {
      /* ignore quota */
    }
  }, [content])

  const get = useCallback((path) => getAt(content, path), [content])

  const patch = useCallback((path, value) => {
    setContent((prev) => setAt(prev, path, value))
  }, [])

  const replaceAll = useCallback((next) => {
    setContent(deepMerge(DEFAULT_SITE_CONTENT, next))
  }, [])

  const resetToDefaults = useCallback(() => {
    const fresh = structuredClone(DEFAULT_SITE_CONTENT)
    setContent(fresh)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ content, get, patch, replaceAll, resetToDefaults }),
    [content, get, patch, replaceAll, resetToDefaults],
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) throw new Error('useSiteContent must be used inside SiteContentProvider')
  return ctx
}

/** Safe optional hook for components that may render outside provider (should not happen). */
export function useSiteContentOptional() {
  return useContext(SiteContentContext)
}
