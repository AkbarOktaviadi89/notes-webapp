'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { createClient } from '@/lib/supabase/client'
import { Note, Notebook, NoteAttachment } from '@/types'
import {
  ArrowLeft, Pin, PinOff, Paperclip, Loader2,
  Trash2, Download, FileText, X, Check,
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Code, Minus, Quote
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import NextImage from 'next/image'

interface Props {
  note: Note & { note_attachments: NoteAttachment[] }
  notebook: Notebook
}

type Editor = NonNullable<ReturnType<typeof useEditor>>

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? 'bg-ink-800 text-paper-100'
          : 'text-ink-500 hover:bg-paper-200 hover:text-ink-800'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-paper-200 bg-paper-50">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Tebal (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Miring (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Garis bawah (Ctrl+U)"
      >
        <UnderlineIcon size={14} />
      </ToolbarBtn>

      <span className="w-px h-4 bg-paper-300 mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Judul 1"
      >
        <span className="font-bold text-xs leading-none">H1</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Judul 2"
      >
        <span className="font-bold text-xs leading-none">H2</span>
      </ToolbarBtn>

      <span className="w-px h-4 bg-paper-300 mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Daftar poin"
      >
        <List size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Daftar bernomor"
      >
        <ListOrdered size={14} />
      </ToolbarBtn>

      <span className="w-px h-4 bg-paper-300 mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Kode inline"
      >
        <Code size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Kutipan"
      >
        <Quote size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        active={false}
        title="Garis pemisah"
      >
        <Minus size={14} />
      </ToolbarBtn>
    </div>
  )
}

export default function NoteEditor({ note, notebook }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPinned, setIsPinned] = useState(note.is_pinned)
  const [attachments, setAttachments] = useState<NoteAttachment[]>(note.note_attachments)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<NodeJS.Timeout>()
  const router = useRouter()
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Mulai menulis catatanmu di sini...' }),
    ],
    content: note.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  // Auto-save
  useEffect(() => {
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 1500)
    return () => clearTimeout(saveTimerRef.current)
  }, [title, content])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('notes').update({ title, content, is_pinned: isPinned }).eq('id', note.id)
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePin = async () => {
    const newVal = !isPinned
    setIsPinned(newVal)
    await supabase.from('notes').update({ is_pinned: newVal }).eq('id', note.id)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus catatan ini secara permanen?')) return
    await supabase.from('notes').delete().eq('id', note.id)
    router.push(`/dashboard/notebook/${notebook.id}`)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user!.id}/${note.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('notaku-files')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: att } = await supabase
          .from('note_attachments')
          .insert({
            note_id: note.id,
            user_id: user!.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          })
          .select()
          .single()

        if (att) {
          const { data: signedData } = await supabase.storage
            .from('notaku-files')
            .createSignedUrl(filePath, 3600)
          setAttachments(prev => [...prev, { ...att, url: signedData?.signedUrl }])
        }
      }
    }

    setUploading(false)
  }

  const handleDeleteAttachment = async (att: NoteAttachment) => {
    if (!confirm('Hapus lampiran ini?')) return
    await supabase.storage.from('notaku-files').remove([att.file_path])
    await supabase.from('note_attachments').delete().eq('id', att.id)
    setAttachments(prev => prev.filter(a => a.id !== att.id))
  }

  const isImage = (type: string) => type.startsWith('image/')
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="border-b border-paper-300 bg-paper-50 px-4 py-3 flex items-center gap-3">
        <Link
          href={`/dashboard/notebook/${notebook.id}`}
          className="btn-ghost p-1.5 flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{notebook.icon} {notebook.title}</span>
        </Link>

        <div className="flex-1" />

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs text-ink-400">
          {saving ? (
            <><Loader2 size={12} className="animate-spin" /> Menyimpan...</>
          ) : saved ? (
            <><Check size={12} className="text-sage-500" /> Tersimpan</>
          ) : (
            <span className="opacity-50">Otomatis tersimpan</span>
          )}
        </div>

        <button
          onClick={handlePin}
          className={`btn-ghost p-1.5 ${isPinned ? 'text-ink-700' : 'text-ink-400'}`}
          title={isPinned ? 'Lepas pin' : 'Pin catatan'}
        >
          {isPinned ? <Pin size={15} fill="currentColor" /> : <PinOff size={15} />}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost p-1.5 text-ink-500"
          title="Lampirkan file"
          disabled={uploading}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
        </button>

        <button
          onClick={handleDelete}
          className="btn-ghost p-1.5 text-ink-400 hover:text-red-500"
          title="Hapus catatan"
        >
          <Trash2 size={15} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Meta */}
          <div className="text-xs text-ink-400 mb-4 flex items-center gap-2">
            <span>{notebook.icon} {notebook.title}</span>
            <span>·</span>
            <span>Diperbarui {format(new Date(note.updated_at), "d MMM yyyy HH:mm", { locale: id })}</span>
          </div>

          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan..."
            rows={1}
            className="w-full font-display text-3xl text-ink-900 bg-transparent border-none outline-none resize-none mb-4 placeholder-ink-200"
            style={{ lineHeight: '1.3' }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement
              el.style.height = 'auto'
              el.style.height = el.scrollHeight + 'px'
            }}
          />

          {/* Rich text editor */}
          <div className="border border-paper-300 rounded-lg overflow-hidden">
            {editor && <Toolbar editor={editor} />}
            <div className="px-4 py-3">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-8 border-t border-paper-200 pt-6">
              <h3 className="text-sm font-medium text-ink-600 mb-3 flex items-center gap-2">
                <Paperclip size={14} />
                Lampiran ({attachments.length})
              </h3>

              {/* Images */}
              {attachments.some(a => isImage(a.file_type)) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {attachments.filter(a => isImage(a.file_type)).map((att) => (
                    <div
                      key={att.id}
                      className="relative group rounded-lg overflow-hidden border border-paper-300 aspect-square cursor-zoom-in"
                      onClick={() => att.url && setLightbox({ url: att.url, name: att.file_name })}
                    >
                      {att.url && (
                        <NextImage
                          src={att.url}
                          alt={att.file_name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-paper-50 rounded-full hover:bg-paper-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={14} className="text-ink-700" />
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(att) }}
                          className="p-1.5 bg-paper-50 rounded-full hover:bg-red-50">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-ink-900/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-paper-100 truncate">{att.file_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other files */}
              {attachments.filter(a => !isImage(a.file_type)).map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-3 bg-paper-100 rounded-lg mb-2 group">
                  <div className="w-8 h-8 bg-paper-300 rounded flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-ink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800 truncate">{att.file_name}</div>
                    <div className="text-xs text-ink-400">{formatSize(att.file_size)}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={att.url} target="_blank" rel="noopener noreferrer"
                      download={att.file_name}
                      className="btn-ghost p-1.5">
                      <Download size={14} />
                    </a>
                    <button onClick={() => handleDeleteAttachment(att)} className="btn-ghost p-1.5 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone hint */}
          <div
            className="mt-6 border-2 border-dashed border-paper-300 rounded-lg p-6 text-center text-ink-400 text-sm cursor-pointer hover:border-ink-300 hover:text-ink-600 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFileUpload(e.dataTransfer.files)
            }}
          >
            <Paperclip size={20} className="mx-auto mb-2 opacity-40" />
            <p>Klik atau drag file untuk dilampirkan</p>
            <p className="text-xs mt-1 opacity-60">Gambar, PDF, dokumen, dll.</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-paper-50/10 hover:bg-paper-50/20 rounded-full text-paper-100 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NextImage
              src={lightbox.url}
              alt={lightbox.name}
              width={1600}
              height={1200}
              className="object-contain max-w-[90vw] max-h-[90vh] w-auto h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-ink-900/60 px-4 py-2 flex items-center justify-between">
              <p className="text-sm text-paper-100 truncate">{lightbox.name}</p>
              <a
                href={lightbox.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-paper-300 hover:text-paper-100 transition-colors ml-4 flex-shrink-0"
              >
                <Download size={13} />
                Unduh
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
