'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading, hasConnection } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !hasConnection) {
            router.push('/baglan')
            return
        }
        if (!loading && !user) {
            router.push('/giris')
        }
    }, [user, loading, hasConnection, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-ink-light text-sm">Kimlik doğrulanıyor...</p>
            </div>
        )
    }

    if (!hasConnection || !user) {
        return null
    }

    return <>{children}</>
}
