import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PageProps {
    params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username, slug } = await params

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single()

    if (!profile) {
        return { title: 'Yazı Bulunamadı' }
    }

    // Get post
    const { data: post } = await supabase
        .from('posts')
        .select('title, content')
        .eq('author_id', profile.id)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!post) {
        return { title: 'Yazı Bulunamadı' }
    }

    // Create description from content (strip HTML, first 160 chars)
    const description = post.content
        .replace(/<[^>]*>/g, '')
        .slice(0, 160)
        .trim() + '...'

    return {
        title: `${post.title} — @${username}`,
        description,
        openGraph: {
            title: post.title,
            description,
            type: 'article',
            authors: [`@${username}`],
        },
    }
}

export default async function PostPage({ params }: PageProps) {
    const { username, slug } = await params

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (!profile) {
        notFound()
    }

    // Get post
    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', profile.id)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
                <Link
                    href={`/${username}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                >
                    <ArrowLeft size={14} />
                    @{username}
                </Link>
                <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
                    FRANZKAFKA.XYZ
                </Link>
            </header>

            {/* Article */}
            <article className="flex-1 px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-ink-light mb-8 pb-8 border-b border-ink">
                        <Link href={`/${username}`} className="hover:underline">
                            @{profile.username}
                        </Link>
                        <span>•</span>
                        <time dateTime={post.inserted_at}>
                            {new Date(post.inserted_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Footer */}
            <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light">
                <div className="max-w-2xl mx-auto flex justify-between">
                    <Link href={`/${username}`} className="hover:underline">
                        ← @{username} yazıları
                    </Link>
                    <span>FranzKafka.xyz</span>
                </div>
            </footer>
        </div>
    )
}
