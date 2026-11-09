const PREFIX = 'msn2005:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* private browsing, quota, etc. — preferences simply do not persist */
  }
}

/** Drop a key that used to be saved, so old data does not linger. */
export function forget(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* nothing to do */
  }
}
