// Database types matching new Supabase schema

export type Visibility = 'public' | 'private' | 'unlisted'

export interface Profile {
    id: string // uuid
    username: string | null
    avatar_url: string | null
    bio: string | null
    updated_at: string
}

export interface Workspace {
    id: string // uuid
    name: string
    slug: string
    owner_id: string
}

export interface Post {
    id: number
    author_id: string
    workspace_id: string | null
    title: string
    content: string
    slug: string
    visibility: Visibility
    inserted_at: string
    is_published: boolean
    // Joined data
    author?: Profile
}

export interface Comment {
    id: number
    post_id: number
    user_id: string
    content: string
    inserted_at: string
    // Joined data
    user?: Profile
}

export interface WritingTelemetry {
    id: number
    post_id: number | null
    user_id: string | null
    wpm: number | null
    session_duration: string | null
    sentiment_score: number | null
    inserted_at: string
}

// For creating new posts
export interface NewPost {
    title: string
    content: string
    slug: string
    visibility?: Visibility
    is_published?: boolean
}

// For local storage draft
export interface LocalDraft {
    title: string
    content: string
    savedAt: string
}
