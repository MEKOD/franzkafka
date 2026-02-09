'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, LogOut, Eye, Trash2, User as UserIcon, ExternalLink, Share2, X, Download, Copy } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui'
import { ProtectedRoute, useAuth } from '@/components/auth'
import { ensureProfile } from '@/lib/ensureProfile'

interface Post {
    id: number
    title: string
    content: string
    slug: string
    visibility: string
    inserted_at: string
    is_published: boolean
}

function statusLabel(p: Post) {
    if (!p.is_published) return 'Legacy Draft'
    return p.visibility === 'public' ? 'Open' : 'Private'
}

function DashboardContent() {
    const router = useRouter()
    const { user, profile, signOut } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [sharePost, setSharePost] = useState<Post | null>(null)
    const [fixingLegacy, setFixingLegacy] = useState(false)

    useEffect(() => {
        async function fetchPosts() {
            if (!user) return

            const { data, error } = await supabaseBrowser
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .order('inserted_at', { ascending: false })

            if (error) {
                console.error('Error fetching posts:', error)
            } else {
                setPosts(data || [])
            }
            setLoading(false)
        }

        fetchPosts()
    }, [user])

    const legacyDrafts = posts.filter(p => !p.is_published)

    const handleNewPost = async () => {
        if (!user) return

        const p = await ensureProfile(user)
        if (!p) {
            console.error('Could not ensure profile')
            return
        }

        const { data, error } = await supabaseBrowser
            .from('posts')
            .insert({
                author_id: user.id,
                title: 'Untitled',
                content: '',
                slug: `post-${Date.now()}`,
                visibility: 'private',
                is_published: true,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating post:', error)
            return
        }

        if (data) {
            router.push(`/duzenle/${data.id}`)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/giris')
    }

    const handleDelete = async (postId: number) => {
        if (!confirm('Delete this post? / Bu yazi silinsin mi?')) return

        const { error } = await supabaseBrowser
            .from('posts')
            .delete()
            .eq('id', postId)

        if (!error) {
            setPosts(posts.filter(p => p.id !== postId))
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const handleShare = async (post: Post) => {
        const username = profile?.username
        if (!username) {
            router.push('/settings/profile')
            return
        }
        if (!post.is_published) {
            alert('Open editor and Save first. / Once duzenle ve Save.')
            return
        }
        if (post.visibility !== 'public') {
            alert('Set to Open to share. / Paylasmak icin Open yap.')
            return
        }

        setSharePost(post)
    }

    const fixAllLegacyDrafts = async () => {
        if (!user) return
        if (legacyDrafts.length === 0) return
        if (!confirm(`Mark ${legacyDrafts.length} legacy drafts as published (Private)?`)) return

        setFixingLegacy(true)
        const { error } = await supabaseBrowser
            .from('posts')
            .update({ is_published: true, visibility: 'private' })
            .eq('author_id', user.id)
            .eq('is_published', false)

        if (error) {
            console.error('Error fixing legacy drafts:', error)
        } else {
            setPosts(posts.map(p => (p.is_published ? p : { ...p, is_published: true, visibility: 'private' })))
        }
        setFixingLegacy(false)
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
                    FRANZKAFKA.XYZ
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-ink-light hidden sm:block">
                        {profile?.username ? `@${profile.username}` : user?.email}
                    </span>
                    <Link href="/settings/profile" className="text-xs hover:underline flex items-center gap-1">
                        <UserIcon size={14} />
                        Profile
                    </Link>
                    <Button onClick={handleNewPost}>
                        <Plus size={14} />
                        New
                    </Button>
                    <Button onClick={handleSignOut} variant="danger">
                        <LogOut size={14} />
                        Sign out
                    </Button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xs uppercase tracking-wider font-semibold mb-4 text-ink-light">
                        My Posts / Yazilarim
                    </h2>

                    {legacyDrafts.length > 0 && (
                        <div className="mb-4 border border-ink p-4 bg-paper-dark">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-xs text-ink-light">
                                    {legacyDrafts.length} legacy draft(s) found. This product no longer uses drafts.
                                </div>
                                <Button onClick={fixAllLegacyDrafts} disabled={fixingLegacy}>
                                    {fixingLegacy ? 'Fixing...' : 'Mark as published'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <p className="text-ink-light text-sm">Loading... / Yukleniyor...</p>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 border border-ink border-dashed">
                            <p className="text-ink-light mb-4">No posts yet. / Henuz yok.</p>
                            <Button onClick={handleNewPost} variant="primary">
                                <Plus size={14} />
                                Create
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border border-ink p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{post.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-ink-light mt-1">
                                            <span>{formatDate(post.inserted_at)}</span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} />
                                                {post.visibility === 'public' ? 'Open' : 'Private'}
                                            </span>
                                            <span className="px-2 py-0.5 border border-ink">{statusLabel(post)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {post.is_published && post.visibility === 'public' && profile?.username && (
                                            <Link
                                                href={`/${profile.username}/${post.slug}`}
                                                className="p-2 hover:bg-paper-dark border border-ink"
                                                title="Open public link"
                                                target="_blank"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleShare(post)}
                                            className="p-2 hover:bg-paper-dark border border-ink"
                                            title="Share card"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <Link href={`/duzenle/${post.id}`}>
                                            <Button>Edit</Button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 text-stamp-red hover:bg-stamp-red/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-ink px-6 py-3 text-xs text-ink-light flex justify-between">
                <span>FranzKafka.xyz — Ledger</span>
                <span>{posts.length} posts</span>
            </footer>

            {sharePost && profile?.username && (
                <ShareCardModal
                    post={sharePost}
                    username={profile.username}
                    onClose={() => setSharePost(null)}
                />
            )}
        </div>
    )
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}

function ShareCardModal({
    post,
    username,
    onClose,
}: {
    post: Post
    username: string
    onClose: () => void
}) {
    const [busy, setBusy] = useState(false)

    const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/${post.slug}`
    const imageUrl = `/${username}/${post.slug}/opengraph-image?v=${post.id}`

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl)
        } catch {
            window.prompt('Copy link:', pageUrl)
        }
    }

    const fetchImageBlob = async () => {
        const res = await fetch(imageUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch image')
        return await res.blob()
    }

    const downloadImage = async () => {
        setBusy(true)
        try {
            const blob = await fetchImageBlob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `franzkafka-${username}-${post.slug}.png`
            a.click()
            URL.revokeObjectURL(url)
        } finally {
            setBusy(false)
        }
    }

    const nativeShare = async () => {
        if (!navigator.share) return
        setBusy(true)
        try {
            const blob = await fetchImageBlob()
            const file = new File([blob], `franzkafka-${post.slug}.png`, { type: 'image/png' })
            const data: ShareData = {
                title: post.title || 'franzkafka.xyz',
                text: `${post.title || 'Untitled'} — franzkafka.xyz`,
                url: pageUrl,
                files: [file],
            }

            // Some browsers require canShare() for files.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canShare = (navigator as any).canShare?.(data)
            if (canShare === false) {
                await navigator.share({ title: data.title, text: data.text, url: data.url })
                return
            }

            await navigator.share(data)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <button
                className="absolute inset-0 bg-ink/30"
                aria-label="Close share modal"
                onClick={onClose}
            />
            <div className="relative w-full max-w-3xl border border-ink bg-paper p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="text-xs uppercase tracking-wider text-ink-light">
                        Share card
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 border border-ink hover:bg-paper-dark"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="border border-ink bg-paper-dark p-3">
                        {/* OG image endpoint: Spotify-ish card for socials */}
                        <Image
                            src={imageUrl}
                            alt="Share card preview"
                            width={1200}
                            height={630}
                            className="w-full h-auto border border-ink"
                            unoptimized
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">{post.title || 'Untitled'}</div>
                        <div className="text-xs text-ink-light break-all">{pageUrl}</div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Button onClick={copyLink} disabled={busy}>
                                <Copy size={14} />
                                Copy link
                            </Button>
                            <Button onClick={downloadImage} disabled={busy}>
                                <Download size={14} />
                                Download PNG
                            </Button>
                            {typeof navigator !== 'undefined' && !!navigator.share && (
                                <Button onClick={nativeShare} disabled={busy}>
                                    <Share2 size={14} />
                                    Share
                                </Button>
                            )}
                        </div>

                        <div className="text-xs text-ink-light">
                            Social networks will also pick this up automatically via Open Graph.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
