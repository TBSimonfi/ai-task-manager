import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not fetch tasks' }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { content, due_date, description } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // Step 1: Create the initial task
  const { data: initialTask, error: createError } = await supabase
    .from('tasks')
    .insert([{ content, user_id: userId, due_date, description }])
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: 'Could not create task' }, { status: 500 });
  }

  // Step 2: Use AI to categorize, prioritize, estimate and tag
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this task: "${content}". 
    Return a JSON object with:
    1. "category": a short category name.
    2. "priority": a number from 1 to 5.
    3. "estimated_hours": a number for duration.
    4. "tags": an array of 2-3 relevant hashtags (e.g. ["#coding", "#urgent"]).
    Return ONLY JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.match(/\{.*\}/s)?.[0];
    if (!jsonString) {
      throw new Error('Invalid response format from Gemini');
    }

    const { category, priority, estimated_hours, tags } = JSON.parse(jsonString);

    // Step 3: Update the task with AI data
    const { data: finalTask, error: updateError } = await supabase
      .from('tasks')
      .update({ 
        category: category || 'General', 
        priority: priority || 3,
        estimated_hours: estimated_hours || 1,
        tags: tags || []
      })
      .eq('id', initialTask.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ task: finalTask });

  } catch (aiError) {
    console.error('Error with Gemini API or processing:', aiError);
    return NextResponse.json({ task: initialTask });
  }
}
