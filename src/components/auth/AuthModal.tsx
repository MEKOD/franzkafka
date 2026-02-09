'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { Button, Input } from '@/components/ui'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    mode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, onSuccess, mode: initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password)
                if (error) {
                    setError('Giriş başarısız. E-posta veya şifre hatalı.')
                    setLoading(false)
                    return
                }
            } else {
                if (password.length < 6) {
                    setError('Şifre en az 6 karakter olmalıdır.')
                    setLoading(false)
                    return
                }
                const { error } = await signUp(email, password)
                if (error) {
                    setError('Kayıt başarısız. Bu e-posta zaten kullanılıyor olabilir.')
                    setLoading(false)
                    return
                }
            }

            // Success - wait a moment for auth state to update
            setTimeout(() => {
                setLoading(false)
                onSuccess()
            }, 500)
        } catch (err) {
            console.error('Auth error:', err)
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-paper border-2 border-ink p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ink-light hover:text-ink"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-1">
                        {mode === 'login' ? 'GİRİŞ YAP' : 'KAYIT OL'}
                    </h2>
                    <p className="text-xs text-ink-light">
                        Yazını kaydetmek için giriş yapmalısın
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="E-posta"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@mail.com"
                        required
                    />

                    <Input
                        label="Şifre"
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
                        {loading
                            ? (mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt yapılıyor...')
                            : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')
                        }
                    </Button>
                </form>

                {/* Toggle mode */}
                <div className="mt-4 text-center text-sm">
                    {mode === 'login' ? (
                        <>
                            <span className="text-ink-light">Hesabın yok mu? </span>
                            <button
                                onClick={() => setMode('register')}
                                className="underline hover:no-underline"
                            >
                                Kayıt Ol
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-ink-light">Zaten hesabın var mı? </span>
                            <button
                                onClick={() => setMode('login')}
                                className="underline hover:no-underline"
                            >
                                Giriş Yap
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
