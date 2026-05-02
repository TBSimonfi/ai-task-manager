import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Could not fetch activities' }, { status: 500 });
  }

  return NextResponse.json({ activities });
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, details, taskId } = await request.json();

  const { data: activity, error } = await supabase
    .from('activities')
    .insert([{
      user_id: session.user.id,
      task_id: taskId || null,
      action,
      details
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not log activity' }, { status: 500 });
  }

  return NextResponse.json({ activity });
}
