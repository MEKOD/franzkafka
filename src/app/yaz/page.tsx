'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui'
import { TipTapEditor } from '@/components/editor'
import { AuthModal, useAuth } from '@/components/auth'
import type { LocalDraft, Visibility } from '@/lib/types'
import { stripHtml, countWords, readingTimeMinutesFromWords } from '@/lib/text'

const DRAFT_KEY = 'franzkafka_draft'

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 50) || `yazi-${Date.now()}`
}

export default function WritePage() {
    const router = useRouter()
    const { user, hasConnection } = useAuth()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [publishVisibility, setPublishVisibility] = useState<Visibility>('private')

    // Load draft from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
            try {
                const draft: LocalDraft = JSON.parse(saved)
                // Hydrating from localStorage is intentional here.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTitle(draft.title)
                setContent(draft.content)
            } catch (e) {
                console.error('Error loading draft:', e)
            }
        }
    }, [])

    // Save draft to localStorage on change
    useEffect(() => {
        if (title || content) {
            const draft: LocalDraft = {
                title,
                content,
                savedAt: new Date().toISOString()
            }
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        }
    }, [title, content])

    const plain = stripHtml(content)
    const words = countWords(plain)
    const minutes = readingTimeMinutesFromWords(words)

    const savePost = useCallback(async () => {
        if (!hasConnection) {
            router.push('/baglan')
            return
        }
        if (!user) {
            setShowAuthModal(true)
            return
        }

        const supabase = getSupabaseBrowserClient()
        setSaving(true)

        // First ensure profile exists
        const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError) {
            console.error('Error checking profile:', profileError)
            setSaving(false)
            return
        }

        if (!existingProfile) {
            const username = user.email?.split('@')[0] || `user-${Date.now()}`
            await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    username,
                })
        }

        const { error } = await supabase
            .from('posts')
            .insert({
                author_id: user.id,
                title: title || 'Untitled',
                content,
                slug: generateSlug(title || 'baslıksız') + '-' + Date.now(),
                visibility: publishVisibility,
                // Bu urunde "draft" kavrami yok: kayit = published.
                is_published: true,
            })

        if (error) {
            console.error('Error saving post:', error)
            setSaving(false)
            return
        }

        localStorage.removeItem(DRAFT_KEY)
        router.push('/dashboard')
    }, [user, hasConnection, title, content, publishVisibility, router])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Cmd+S / Ctrl+S
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                if (!saving) savePost()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [savePost, saving])

    const handleAuthSuccess = useCallback(() => {
        setShowAuthModal(false)
        savePost()
    }, [savePost])

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm hover:underline"
                >
                    <ArrowLeft size={14} />
                    Home / Ana Sayfa
                </Link>

                <div className="flex items-center gap-2">
                    <select
                        value={publishVisibility}
                        onChange={(e) => setPublishVisibility(e.target.value as Visibility)}
                        className="px-3 py-2 bg-transparent border border-ink text-sm"
                        aria-label="Publish visibility"
                        disabled={saving}
                    >
                        <option value="private">Private</option>
                        <option value="public">Open</option>
                    </select>
                    <Button onClick={savePost} variant="primary" disabled={saving}>
                        <Save size={14} />
                        {saving ? 'Saving... / Kaydediliyor' : 'Save'}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1">
                {/* Editor Area */}
                <main className="p-8 max-w-4xl mx-auto">
                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title... / Baslik..."
                        className="
              w-full text-2xl font-semibold mb-6 pb-2
              bg-transparent border-b-2 border-ink
              focus:outline-none
              placeholder:text-ink-light
            "
                    />

                    {/* Divider Line */}
                    <div className="border-t border-ink mb-6" />

                    {/* TipTap Editor */}
                    <TipTapEditor
                        content={content}
                        onChange={setContent}
                    />
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-ink px-6 py-3 text-xs text-ink-light flex justify-between">
                <span>Local draft autosave</span>
                <span>{words} words · {minutes} min</span>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    )
}
