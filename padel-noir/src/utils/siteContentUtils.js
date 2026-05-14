/** Parse "a.b.0.c" into keys; numeric segments become numbers. */
export function parsePath(pathStr) {
  return pathStr.split('.').map((part) => {
    const n = Number(part)
    return Number.isInteger(n) && String(n) === part ? n : part
  })
}

export function getAt(root, pathStr) {
  const parts = parsePath(pathStr)
  return parts.reduce((o, k) => (o == null ? undefined : o[k]), root)
}

export function setAt(root, pathStr, value) {
  const parts = parsePath(pathStr)
  const next = structuredClone(root)
  let cur = next
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    const nk = parts[i + 1]
    if (cur[k] == null) cur[k] = typeof nk === 'number' ? [] : {}
    cur = cur[k]
  }
  cur[parts[parts.length - 1]] = value
  return next
}

export function deepClone(obj) {
  return structuredClone(obj)
}

/** Merge patch into base (objects recurse; arrays and scalars from patch replace). */
export function deepMerge(base, patch) {
  if (patch === undefined) return deepClone(base)
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return deepClone(patch)
  const out = deepClone(base)
  for (const k of Object.keys(patch)) {
    const pv = patch[k]
    const bv = out[k]
    if (pv !== null && typeof pv === 'object' && !Array.isArray(pv) && bv !== null && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = deepMerge(bv, pv)
    } else {
      out[k] = deepClone(pv)
    }
  }
  return out
}
