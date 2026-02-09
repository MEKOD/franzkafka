'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth'
import { Button, Input } from '@/components/ui'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match. / Sifreler eslesmiyor.')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters. / En az 6 karakter.')
            return
        }

        setLoading(true)

        const { error } = await signUp(email, password)

        if (error) {
            setError('Sign-up failed. Email may already be in use. / Kayit basarisiz.')
            setLoading(false)
        } else {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center">
                    <div className="border border-stamp-green p-6 bg-stamp-green/5">
                        <h2 className="text-xl font-bold text-stamp-green mb-2">SUCCESS</h2>
                        <p className="text-sm mb-4">
                            Check your email for a verification link. / Dogrulama linki gonderildi.
                        </p>
                        <Link href="/giris">
                            <Button>Go to Sign In / Giris</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">SIGN UP</h1>
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
                            placeholder="At least 6 characters / En az 6"
                            required
                        />

                        <Input
                            label="Confirm (Tekrar)"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password / Tekrar"
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
                            {loading ? 'Signing up... / Kayit' : 'Sign up / Kayit ol'}
                        </Button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center text-sm">
                    <span className="text-ink-light">Already have an account? / Zaten var mi? </span>
                    <Link href="/giris" className="underline hover:no-underline">
                        Sign in / Giris
                    </Link>
                </div>
            </div>
        </div>
    )
}
