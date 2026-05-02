import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: habits, error } = await supabase
    .from('habits')
    .select('*, habit_logs(completed_at)')
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: 'Could not fetch habits' }, { status: 500 });
  }

  return NextResponse.json({ habits });
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, color } = await request.json();

  const { data: habit, error } = await supabase
    .from('habits')
    .insert([{
      user_id: session.user.id,
      title,
      color
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not create habit' }, { status: 500 });
  }

  return NextResponse.json({ habit });
}
