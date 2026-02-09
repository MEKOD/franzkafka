'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, ExternalLink, Eye, EyeOff, Trash2, Link2, User as UserIcon } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui'
import { ProtectedRoute, useAuth } from '@/components/auth'
import type { Post } from '@/lib/types'

function YazlarimContent() {
    const router = useRouter()
    const { user, profile, signOut } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!user) return

            // Fetch posts
            const { data: postsData, error } = await supabaseBrowser
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .order('inserted_at', { ascending: false })

            if (error) {
                console.error('Error fetching posts:', error)
            } else {
                setPosts(postsData || [])
            }
            setLoading(false)
        }

        fetchData()
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
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
        if (!post.is_published || post.visibility !== 'public') {
            alert('Publish as public to share. / Paylasmak icin public yayinla.')
            return
        }
        const username = profile?.username
        if (!username) {
            router.push('/settings/profile')
            return
        }

        const url = `${window.location.origin}/${username}/${post.slug}`
        try {
            await navigator.clipboard.writeText(url)
            alert('Link copied. / Kopyalandi.')
        } catch {
            window.prompt('Copy link:', url)
        }
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
                    <Link href="/yaz">
                        <Button>
                            <Plus size={14} />
                            New
                        </Button>
                    </Link>
                    <Button onClick={handleSignOut} variant="danger">
                        <LogOut size={14} />
                        Sign out
                    </Button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold">MY POSTS</h1>
                        {profile?.username && (
                            <Link
                                href={`/${profile.username}`}
                                className="text-sm text-ink-light hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                View profile
                            </Link>
                        )}
                    </div>

                    {/* Posts List */}
                    {loading ? (
                        <p className="text-ink-light text-sm">Loading... / Yukleniyor...</p>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 border border-ink border-dashed">
                            <p className="text-ink-light mb-4">No posts yet. / Henuz yok.</p>
                            <Link href="/yaz">
                                <Button variant="primary">
                                    <Plus size={14} />
                                    Create
                                </Button>
                            </Link>
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
                                                {post.is_published ? (
                                                    <>
                                                        <Eye size={12} />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff size={12} />
                                                        Draft
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {post.is_published && profile?.username && (
                                            <Link
                                                href={`/${profile.username}/${post.slug}`}
                                                className="text-sm text-ink-light hover:text-ink"
                                                target="_blank"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleShare(post)}
                                            className="p-2 hover:bg-paper-dark border border-ink"
                                            title="Copy share link"
                                        >
                                            <Link2 size={16} />
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
        </div>
    )
}

export default function YazlarimPage() {
    return (
        <ProtectedRoute>
            <YazlarimContent />
        </ProtectedRoute>
    )
}
