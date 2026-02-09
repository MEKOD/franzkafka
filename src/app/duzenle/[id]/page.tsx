'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Send, Trash2, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui'
import { TipTapEditor } from '@/components/editor'
import { ProtectedRoute, useAuth } from '@/components/auth'
import type { Post, Visibility } from '@/lib/types'

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

function EditContent() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const postId = params.id as string

    const [post, setPost] = useState<Post | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [visibility, setVisibility] = useState<Visibility>('private')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function fetchPost() {
            const { data, error } = await supabaseBrowser
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single()

            if (error || !data) {
                console.error('Error fetching post:', error)
                router.push('/dashboard')
                return
            }

            // Check ownership
            if (data.author_id !== user?.id) {
                router.push('/dashboard')
                return
            }

            setPost(data)
            setTitle(data.title || '')
            setContent(data.content || '')
            setVisibility((data.visibility || 'private') as Visibility)
            setLoading(false)
        }

        if (user) {
            fetchPost()
        }
    }, [postId, router, user])

    const handleSave = useCallback(async (publish: boolean = false) => {
        if (!post) return

        setSaving(true)
        const updates: Partial<Post> = {
            title: title || 'Başlıksız',
            content,
            slug: generateSlug(title || 'baslıksız') + '-' + post.id,
            visibility,
        }

        if (publish) {
            updates.is_published = true
        }

        const { error } = await supabaseBrowser
            .from('posts')
            .update(updates)
            .eq('id', post.id)

        if (error) {
            console.error('Error saving post:', error)
        } else if (publish) {
            router.push('/dashboard')
        }
        setSaving(false)
    }, [post, title, content, visibility, router])

    const handleUnpublish = useCallback(async () => {
        if (!post) return
        setSaving(true)
        const { error } = await supabaseBrowser
            .from('posts')
            .update({ is_published: false, visibility: 'private' })
            .eq('id', post.id)

        if (error) {
            console.error('Error unpublishing post:', error)
        } else {
            setPost({ ...post, is_published: false, visibility: 'private' })
            setVisibility('private')
        }
        setSaving(false)
    }, [post])

    const handleDelete = async () => {
        if (!post) return
        if (!confirm('Delete this post? / Bu yazi silinsin mi?')) return

        const { error } = await supabaseBrowser
            .from('posts')
            .delete()
            .eq('id', post.id)

        if (!error) {
            router.push('/dashboard')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-ink-light text-sm">Loading... / Yukleniyor...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm hover:underline"
                >
                    <ArrowLeft size={14} />
                    My Posts / Yazilarim
                </Link>

                <div className="flex items-center gap-2">
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as Visibility)}
                        className="px-3 py-2 bg-transparent border border-ink text-sm"
                        aria-label="Post visibility"
                        disabled={saving}
                    >
                        <option value="private">Private</option>
                        <option value="public">Open</option>
                    </select>
                    <Button onClick={() => handleSave(false)} disabled={saving}>
                        <Save size={14} />
                        {saving ? 'Saving... / Kaydediliyor' : 'Save / Kaydet'}
                    </Button>
                    {!post?.is_published && (
                        <Button onClick={() => handleSave(true)} variant="primary" disabled={saving}>
                            <Send size={14} />
                            Publish / Yayinla
                        </Button>
                    )}
                    {post?.is_published && (
                        <Button onClick={handleUnpublish} disabled={saving}>
                            <EyeOff size={14} />
                            Unpublish
                        </Button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="p-2 text-stamp-red hover:bg-stamp-red/10 border border-stamp-red"
                    >
                        <Trash2 size={16} />
                    </button>
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
                <span>
                    {post?.is_published ? `Published (${visibility === 'public' ? 'Open' : 'Private'})` : 'Draft / Taslak'}
                </span>
                <span>Daktilo — FranzKafka.xyz</span>
            </footer>
        </div>
    )
}

export default function EditPage() {
    return (
        <ProtectedRoute>
            <EditContent />
        </ProtectedRoute>
    )
}
