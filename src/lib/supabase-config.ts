export interface SupabaseConnectionConfig {
  url: string
  anonKey: string
}

export type SupabaseConnectionSource = 'none' | 'env' | 'custom'

export interface ResolvedSupabaseConnection {
  config: SupabaseConnectionConfig | null
  source: SupabaseConnectionSource
}

const STORAGE_KEY = 'ledger_supabase_config_v1'
const USE_CUSTOM_KEY = 'ledger_use_custom_supabase_v1'
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

function isCustomSupabaseEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(USE_CUSTOM_KEY) === '1'
}

export function saveSupabaseConfig(config: SupabaseConnectionConfig) {
  if (typeof window === 'undefined') return
  const parsed = parseConfig(config)
  if (!parsed) throw new Error('Invalid Supabase config')
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  window.localStorage.setItem(USE_CUSTOM_KEY, '1')
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function disableCustomSupabaseConfig() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(USE_CUSTOM_KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function clearSupabaseConfig() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(USE_CUSTOM_KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function resolveSupabaseConnection(): ResolvedSupabaseConnection {
  const env = getEnvSupabaseConfig()
  const stored = getStoredSupabaseConfig()

  if (isCustomSupabaseEnabled() && stored) {
    return { config: stored, source: 'custom' }
  }

  if (env) {
    return { config: env, source: 'env' }
  }

  if (stored) {
    return { config: stored, source: 'custom' }
  }

  return { config: null, source: 'none' }
}

export function resolveSupabaseConfig(): SupabaseConnectionConfig | null {
  return resolveSupabaseConnection().config
}

export function hasDefaultSupabaseConfig(): boolean {
  return !!getEnvSupabaseConfig()
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

export function getSupabaseConfigClientSnapshot(): ResolvedSupabaseConnection {
  return resolveSupabaseConnection()
}

export function getSupabaseConfigServerSnapshot(): ResolvedSupabaseConnection {
  const env = getEnvSupabaseConfig()
  if (!env) return { config: null, source: 'none' }
  return { config: env, source: 'env' }
}
