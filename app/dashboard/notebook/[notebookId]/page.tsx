import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NotebookView from '@/components/notes/NotebookView'

export default async function NotebookPage({ params }: { params: { notebookId: string } }) {
  const supabase = createClient()

  const [{ data: notebook }, { data: notes }] = await Promise.all([
    supabase.from('notebooks').select('*').eq('id', params.notebookId).single(),
    supabase.from('notes')
      .select('*, note_attachments(count)')
      .eq('notebook_id', params.notebookId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false }),
  ])

  if (!notebook) notFound()

  return <NotebookView notebook={notebook} initialNotes={notes || []} />
}
