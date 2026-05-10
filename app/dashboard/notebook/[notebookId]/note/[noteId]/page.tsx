import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NoteEditor from '@/components/notes/NoteEditor'

export default async function NotePage({
  params,
}: {
  params: { notebookId: string; noteId: string }
}) {
  const supabase = createClient()

  const [{ data: note }, { data: notebook }] = await Promise.all([
    supabase
      .from('notes')
      .select('*, note_attachments(*)')
      .eq('id', params.noteId)
      .single(),
    supabase.from('notebooks').select('*').eq('id', params.notebookId).single(),
  ])

  if (!note || !notebook) notFound()

  // Get signed URLs for attachments
  const attachments = await Promise.all(
    (note.note_attachments || []).map(async (att: any) => {
      const { data } = await supabase.storage
        .from('SevNotes-files')
        .createSignedUrl(att.file_path, 3600)
      return { ...att, url: data?.signedUrl }
    })
  )

  return (
    <NoteEditor
      note={{ ...note, note_attachments: attachments }}
      notebook={notebook}
    />
  )
}
