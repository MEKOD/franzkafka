import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PageProps {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio')
        .eq('username', username)
        .single()

    if (!profile) {
        return { title: 'Kullanıcı Bulunamadı' }
    }

    return {
        title: `@${profile.username} — FranzKafka.xyz`,
        description: profile.bio || `${profile.username} kullanıcısının yazıları`,
    }
}

export default async function UserProfilePage({ params }: PageProps) {
    const { username } = await params

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (!profile) {
        notFound()
    }

    // Get published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, slug, inserted_at, visibility')
        .eq('author_id', profile.id)
        .eq('is_published', true)
        .eq('visibility', 'public')
        .order('inserted_at', { ascending: false })

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-ink px-6 py-4">
                <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
                    FRANZKAFKA.XYZ
                </Link>
            </header>

            {/* Profile Header */}
            <section className="border-b border-ink px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-2">@{profile.username}</h1>
                    {profile.bio && (
                        <p className="text-ink-light">{profile.bio}</p>
                    )}
                    <p className="text-xs text-ink-light mt-4">
                        {posts?.length || 0} yazı
                    </p>
                </div>
            </section>

            {/* Posts List */}
            <main className="flex-1 px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xs uppercase tracking-wider font-semibold mb-4 text-ink-light">
                        Yazılar
                    </h2>

                    {posts && posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/${username}/${post.slug}`}
                                    className="block border border-ink p-4 hover:bg-paper-dark"
                                >
                                    <h3 className="font-semibold mb-1">{post.title}</h3>
                                    <p className="text-xs text-ink-light">
                                        {new Date(post.inserted_at).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-ink-light text-sm">Henüz yazı yok.</p>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light text-center">
                <p>FranzKafka.xyz — Kayıt Defteri</p>
            </footer>
        </div>
    )
}
