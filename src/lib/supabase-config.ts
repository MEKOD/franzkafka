export interface SupabaseConnectionConfig {
  url: string
  anonKey: string
}

const STORAGE_KEY = 'ledger_supabase_config_v1'
const CHANGE_EVENT = 'ledger_supabase_config_changed'

function normalizeUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '')
}

function parseConfig(input: Partial<SupabaseConnectionConfig> | null | undefined): SupabaseConnectionConfig | null {
  if (!input?.url || !input?.anonKey) return null
  const url = normalizeUrl(input.url)
  const anonKey = input.anonKey.trim()
  if (!url || !anonKey) return null

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  } catch {
    return null
  }

  return { url, anonKey }
}

export function getEnvSupabaseConfig(): SupabaseConnectionConfig | null {
  return parseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

export function getStoredSupabaseConfig(): SupabaseConnectionConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SupabaseConnectionConfig>
    return parseConfig(parsed)
  } catch {
    return null
  }
}

export function saveSupabaseConfig(config: SupabaseConnectionConfig) {
  if (typeof window === 'undefined') return
  const parsed = parseConfig(config)
  if (!parsed) throw new Error('Invalid Supabase config')
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function clearSupabaseConfig() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function resolveSupabaseConfig(): SupabaseConnectionConfig | null {
  return getStoredSupabaseConfig() || getEnvSupabaseConfig()
}

export function subscribeSupabaseConfig(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = () => onChange()
  window.addEventListener('storage', handler)
  window.addEventListener(CHANGE_EVENT, handler)

  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(CHANGE_EVENT, handler)
  }
}

export function getSupabaseConfigClientSnapshot(): SupabaseConnectionConfig | null {
  return resolveSupabaseConfig()
}

export function getSupabaseConfigServerSnapshot(): SupabaseConnectionConfig | null {
  return getEnvSupabaseConfig()
}
