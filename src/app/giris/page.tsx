'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth'
import { Button, Input } from '@/components/ui'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await signIn(email, password)

        if (error) {
            setError('Sign-in failed. Check email/password. / Giris basarisiz.')
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">SIGN IN</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="border border-ink p-6 bg-paper">
                    <div className="space-y-4">
                        <Input
                            label="Email (E-posta)"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@mail.com"
                            required
                        />

                        <Input
                            label="Password (Sifre)"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="p-3 border border-stamp-red bg-stamp-red/5 text-stamp-red text-xs">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in... / Giris' : 'Sign in / Giris'}
                        </Button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center text-sm">
                    <span className="text-ink-light">No account? / Hesabin yok mu? </span>
                    <Link href="/kayit-ol" className="underline hover:no-underline">
                        Sign up / Kayit ol
                    </Link>
                </div>
            </div>
        </div>
    )
}
