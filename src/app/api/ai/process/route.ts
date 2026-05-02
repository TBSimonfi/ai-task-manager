import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: Request) {
  const { action, payload } = await request.json();
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let result;
    switch (action) {
      case 'badge':
        result = await model.generateContent(`Generate a short, encouraging badge description for: ${JSON.stringify(payload)}`);
        return NextResponse.json({ badge: result.response.text() });
      case 'breakdown':
        result = await model.generateContent(`Break down this task into 3 actionable steps: ${payload.taskContent}`);
        return NextResponse.json({ breakdown: result.response.text() });
      case 'briefing':
        result = await model.generateContent(`Provide a morning briefing for tasks: ${JSON.stringify(payload)}`);
        return NextResponse.json({ briefing: result.response.text() });
      case 'chat':
        result = await model.generateContent(`Chat assistant response: ${payload.message}`);
        return NextResponse.json({ reply: result.response.text() });
      case 'conflicts':
        result = await model.generateContent(`Resolve task conflicts: ${JSON.stringify(payload)}`);
        return NextResponse.json({ conflicts: result.response.text() });
      case 'quote':
        result = await model.generateContent(`Provide a short, motivating productivity quote.`);
        return NextResponse.json({ quote: result.response.text() });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
