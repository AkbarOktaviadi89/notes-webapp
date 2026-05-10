import NotebookView from '@/components/notes/NotebookView'

export default function NotebookPage({ params }: { params: { notebookId: string } }) {
  return <NotebookView notebookId={params.notebookId} />
}
