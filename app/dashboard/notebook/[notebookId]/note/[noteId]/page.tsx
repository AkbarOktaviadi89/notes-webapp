import NoteEditorWrapper from '@/components/notes/NoteEditorWrapper'

export default function NotePage({
  params,
}: {
  params: { notebookId: string; noteId: string }
}) {
  return <NoteEditorWrapper noteId={params.noteId} notebookId={params.notebookId} />
}
