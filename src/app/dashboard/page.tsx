'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Eye, EyeOff, Trash2, Link2, User as UserIcon } from 'lucide-react'
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

function DashboardContent() {
    const router = useRouter()
    const { user, profile, signOut } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

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
                is_published: false,
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

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}
