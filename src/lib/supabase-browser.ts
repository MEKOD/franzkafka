import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveSupabaseConfig } from '@/lib/supabase-config'

const clients = new Map<string, SupabaseClient>()

export function getSupabaseBrowserClient(): SupabaseClient {
    const config = resolveSupabaseConfig()
    if (!config) {
        throw new Error('Supabase is not connected yet.')
    }

    const cacheKey = `${config.url}::${config.anonKey}`
    const cached = clients.get(cacheKey)
    if (cached) return cached

    const client = createBrowserClient(config.url, config.anonKey)
    clients.set(cacheKey, client)
    return client
}
