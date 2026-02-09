'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface TipTapEditorProps {
    content: string
    onChange: (content: string) => void
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                // Prevent placeholder from appearing on every empty paragraph.
                placeholder: ({ editor }) => (editor.isEmpty ? 'Write here... / Buraya yaz...' : ''),
                showOnlyCurrent: true,
                includeChildren: false,
            }),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'editor-area prose prose-sm max-w-none focus:outline-none min-h-[60vh]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    return <EditorContent editor={editor} />
}
