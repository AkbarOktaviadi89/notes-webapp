'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Note, Notebook, NoteAttachment } from '@/types'
import NoteEditor from './NoteEditor'

interface Props {
  noteId: string
  notebookId: string
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

function NoteEditorSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-paper-300 bg-paper-50 px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Skeleton className="h-3 w-48 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="space-y-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-4/6' : i % 2 === 0 ? 'w-5/6' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NoteEditorWrapper({ noteId, notebookId }: Props) {
  const [note, setNote] = useState<(Note & { note_attachments: NoteAttachment[] }) | null>(null)
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    setNote(null)
    setNotebook(null)
    let cancelled = false

    async function load() {
      const [{ data: noteData }, { data: notebookData }] = await Promise.all([
        supabase.from('notes').select('*, note_attachments(*)').eq('id', noteId).single(),
        supabase.from('notebooks').select('*').eq('id', notebookId).single(),
      ])

      if (cancelled || !noteData || !notebookData) return

      // Generate signed URLs for attachments on client
      const attachments: NoteAttachment[] = await Promise.all(
        (noteData.note_attachments || []).map(async (att: NoteAttachment) => {
          const { data } = await supabase.storage
            .from('SevNotes-files')
            .createSignedUrl(att.file_path, 3600)
          return { ...att, url: data?.signedUrl }
        })
      )

      if (cancelled) return
      setNote({ ...noteData, note_attachments: attachments })
      setNotebook(notebookData)
    }

    load()
    return () => { cancelled = true }
  }, [noteId, notebookId])

  if (!note || !notebook) return <NoteEditorSkeleton />

  return <NoteEditor note={note} notebook={notebook} />
}
