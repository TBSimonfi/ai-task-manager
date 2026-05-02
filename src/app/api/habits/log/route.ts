import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { habitId, date } = await request.json();

  const { data, error } = await supabase
    .from('habit_logs')
    .insert([{
      user_id: session.user.id,
      habit_id: habitId,
      completed_at: date || new Date().toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) {
    // If already exists, delete it (toggle)
    if (error.code === '23505') {
        await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_at', date || new Date().toISOString().split('T')[0])
          .eq('user_id', session.user.id);
        
        return NextResponse.json({ toggled: false });
    }
    return NextResponse.json({ error: 'Could not log habit' }, { status: 500 });
  }

  return NextResponse.json({ toggled: true });
}
