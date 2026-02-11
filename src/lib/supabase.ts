import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getEnvSupabaseConfig } from '@/lib/supabase-config'

export function getSupabaseClientFromEnv(): SupabaseClient | null {
  const config = getEnvSupabaseConfig()
  if (!config) return null
  return createClient(config.url, config.anonKey)
}
