'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Copy, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface Post {
    id: number
    title: string
    slug: string
}

interface ShareCardModalProps {
    post: Post
    username: string
    onClose: () => void
}

export function ShareCardModal({ post, username, onClose }: ShareCardModalProps) {
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
