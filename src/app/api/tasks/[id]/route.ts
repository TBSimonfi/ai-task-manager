import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { content, status, due_date, category, priority, description, sub_tasks, is_archived } = await request.json();

  if (content === undefined && status === undefined && due_date === undefined && category === undefined && priority === undefined && description === undefined && sub_tasks === undefined && is_archived === undefined) {
    return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
  }

  const updateData: {
    content?: string;
    status?: string;
    due_date?: string | null;
    category?: string | null;
    priority?: number;
    description?: string | null;
    sub_tasks?: any;
    is_archived?: boolean;
  } = {};
  if (content !== undefined) updateData.content = content;
  if (status !== undefined) updateData.status = status;
  if (due_date !== undefined) updateData.due_date = due_date;
  if (category !== undefined) updateData.category = category;
  if (priority !== undefined) updateData.priority = priority;
  if (description !== undefined) updateData.description = description;
  if (sub_tasks !== undefined) updateData.sub_tasks = sub_tasks;
  if (is_archived !== undefined) updateData.is_archived = is_archived;

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Could not update task' }, { status: 500 });
  }

  return NextResponse.json({ task: updatedTask });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Could not delete task' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
