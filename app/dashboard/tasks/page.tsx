import { createClient } from '@/lib/supabase/server'
import TasksView from '@/components/tasks/TasksView'

export default async function TasksPage() {
  const supabase = createClient()

  const [{ data: tasks }, { data: notebooks }] = await Promise.all([
    supabase.from('tasks').select('*').order('is_completed', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('notebooks').select('id, title, icon'),
  ])

  return <TasksView initialTasks={tasks || []} notebooks={notebooks || []} />
}
