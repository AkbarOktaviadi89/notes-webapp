export interface Notebook {
  id: string
  user_id: string
  title: string
  description?: string
  color: string
  icon: string
  created_at: string
  updated_at: string
  notes?: Note[]
  _count?: { notes: number }
}

export interface Note {
  id: string
  user_id: string
  notebook_id: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  attachments?: NoteAttachment[]
}

export interface NoteAttachment {
  id: string
  note_id: string
  user_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  url?: string
}

export interface Task {
  id: string
  user_id: string
  notebook_id?: string
  title: string
  is_completed: boolean
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  completed_at?: string
  created_at: string
  updated_at: string
}
