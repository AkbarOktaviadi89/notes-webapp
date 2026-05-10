'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Note, Notebook } from '@/types'
import { Plus, Search, Pin, FileText, Paperclip, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

type SortOption = 'newest' | 'oldest' | 'az' | 'za'

interface Props {
  notebookId: string
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '')

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

function NotebookSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-paper-300 px-6 py-5 bg-paper-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div>
              <Skeleton className="h-7 w-48 mb-1.5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </div>
      <div className="flex-1 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="paper-card-plain p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1.5" />
              <Skeleton className="h-3 w-5/6 mb-4" />
              <div className="border-t border-paper-200 pt-3">
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function NotebookView({ notebookId }: Props) {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useRef(createClient()).current

  useEffect(() => {
    setLoading(true)
    let cancelled = false

    async function load() {
      const [{ data: nb }, { data: ns }] = await Promise.all([
        supabase.from('notebooks').select('*').eq('id', notebookId).single(),
        supabase.from('notes')
          .select('*, note_attachments(count)')
          .eq('notebook_id', notebookId),
      ])
      if (cancelled) return
      if (!nb) { router.push('/dashboard'); return }
      setNotebook(nb)
      setNotes(ns || [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [notebookId])

  const sortedFiltered = useMemo(() => {
    if (!notes.length) return []
    const filtered = notes.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(n.content).toLowerCase().includes(search.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      switch (sort) {
        case 'newest': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'oldest': return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case 'az': return a.title.localeCompare(b.title)
        case 'za': return b.title.localeCompare(a.title)
        default: return 0
      }
    })
  }, [notes, search, sort])

  const createNote = async () => {
    if (!notebook) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('notes')
      .insert({ notebook_id: notebookId, user_id: user!.id, title: 'Catatan Baru', content: '' })
      .select()
      .single()
    setCreating(false)
    if (data) router.push(`/dashboard/notebook/${notebookId}/note/${data.id}`)
  }

  const deleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Hapus catatan ini?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  if (loading || !notebook) return <NotebookSkeleton />

  const sortLabels: Record<SortOption, string> = {
    newest: 'Terbaru', oldest: 'Terlama', az: 'A–Z', za: 'Z–A',
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="border-b border-paper-300 px-6 py-5 bg-paper-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{notebook.icon}</span>
            <div>
              <h1 className="font-display text-2xl text-ink-900">{notebook.title}</h1>
              {notebook.description && (
                <p className="text-ink-400 text-sm mt-0.5">{notebook.description}</p>
              )}
              <p className="text-ink-400 text-xs mt-1">{notes.length} catatan</p>
            </div>
          </div>
          <button
            onClick={createNote}
            disabled={creating}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Catatan Baru
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="input-field pl-9 text-sm w-full"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="input-field text-sm px-3 w-32 cursor-pointer"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((k) => (
              <option key={k} value={k}>{sortLabels[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-auto p-6">
        {sortedFiltered.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={40} className="text-ink-200 mx-auto mb-3" />
            <p className="text-ink-400 mb-4">
              {search ? 'Catatan tidak ditemukan' : 'Belum ada catatan di notebook ini'}
            </p>
            {!search && (
              <button onClick={createNote} className="btn-primary text-sm">
                <Plus size={14} className="inline mr-1" /> Buat Catatan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedFiltered.map((note, i) => (
              <Link
                key={note.id}
                href={`/dashboard/notebook/${notebookId}/note/${note.id}`}
                className="paper-card-plain p-4 hover:border-ink-200 hover:shadow-md transition-all group relative animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {note.is_pinned && (
                  <Pin size={12} className="absolute top-3 right-3 text-ink-400" fill="currentColor" />
                )}
                <div className="pr-4">
                  <h3 className="font-medium text-ink-800 group-hover:text-ink-900 mb-1 truncate">
                    {note.title}
                  </h3>
                  {note.content && (
                    <p className="text-ink-400 text-sm line-clamp-3 leading-relaxed">
                      {stripHtml(note.content)}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-paper-200">
                  <span className="text-xs text-ink-400">
                    {format(new Date(note.updated_at), "d MMM yyyy", { locale: id })}
                  </span>
                  <div className="flex items-center gap-2">
                    {(note as any).note_attachments?.[0]?.count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <Paperclip size={10} />
                        {(note as any).note_attachments[0].count}
                      </span>
                    )}
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-ink-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
