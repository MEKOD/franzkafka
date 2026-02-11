'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useSyncExternalStore } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { SupabaseConnectionConfig } from '@/lib/supabase-config'
import {
    clearSupabaseConfig,
    disableCustomSupabaseConfig,
    getSupabaseConfigClientSnapshot,
    getSupabaseConfigServerSnapshot,
    hasDefaultSupabaseConfig,
    saveSupabaseConfig,
    subscribeSupabaseConfig,
} from '@/lib/supabase-config'
import type { Profile } from '@/lib/types'
import { ensureProfile } from '@/lib/ensureProfile'

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    connection: SupabaseConnectionConfig | null
    connectionSource: 'none' | 'env' | 'custom'
    hasConnection: boolean
    hasDefaultConnection: boolean
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    connectSupabase: (url: string, anonKey: string) => Promise<{ error: Error | null }>
    switchToDefaultSupabase: () => Promise<void>
    disconnectSupabase: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const connection = useSyncExternalStore(
        subscribeSupabaseConfig,
        getSupabaseConfigClientSnapshot,
        getSupabaseConfigServerSnapshot
    )
    const [loading, setLoading] = useState<boolean>(() => !!getSupabaseConfigClientSnapshot().config)
    const activeConnectionConfig = connection.config

    useEffect(() => {
        if (!activeConnectionConfig) return

        const supabase = getSupabaseBrowserClient()

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                setSession(nextSession)
                setUser(nextSession?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [activeConnectionConfig])

    useEffect(() => {
        let cancelled = false

        async function sync() {
            if (!user || !activeConnectionConfig) {
                setProfile(null)
                return
            }

            const p = await ensureProfile(user, getSupabaseBrowserClient())
            if (!cancelled) setProfile(p)
        }

        sync()
        return () => {
            cancelled = true
        }
    }, [user, activeConnectionConfig])

    const signIn = async (email: string, password: string) => {
        if (!connection.config) return { error: new Error('No Supabase connection configured') }
        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error as Error | null }
    }

    const signUp = async (email: string, password: string) => {
        if (!connection.config) return { error: new Error('No Supabase connection configured') }
        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error as Error | null }
    }

    const signOut = async () => {
        if (!connection.config) return
        const supabase = getSupabaseBrowserClient()
        await supabase.auth.signOut()
    }

    const connectSupabase = async (url: string, anonKey: string) => {
        try {
            saveSupabaseConfig({ url, anonKey })
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(true)
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const disconnectSupabase = async () => {
        if (connection.config) {
            try {
                await getSupabaseBrowserClient().auth.signOut()
            } catch {
                // Ignore sign-out errors while disconnecting.
            }
        }
        clearSupabaseConfig()
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
    }

    const switchToDefaultSupabase = async () => {
        if (!hasDefaultSupabaseConfig()) return
        if (activeConnectionConfig) {
            try {
                await getSupabaseBrowserClient().auth.signOut()
            } catch {
                // Ignore sign-out errors while switching.
            }
        }
        disableCustomSupabaseConfig()
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(true)
    }

    const refreshProfile = async () => {
        if (!user) return
        const p = await ensureProfile(user, getSupabaseBrowserClient())
        setProfile(p)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                connection: connection.config,
                connectionSource: connection.source,
                hasConnection: !!connection.config,
                hasDefaultConnection: hasDefaultSupabaseConfig(),
                loading,
                signIn,
                signUp,
                signOut,
                connectSupabase,
                switchToDefaultSupabase,
                disconnectSupabase,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
