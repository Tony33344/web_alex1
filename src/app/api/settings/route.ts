import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings').select('*').order('key');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Convert to key-value object for easier consumption
  const settings: Record<string, string> = {};
  (data || []).forEach((s: any) => {
    let value = s.value;
    // Remove JSON string quotes if present
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    settings[s.key] = value;
  });
  
  return NextResponse.json(settings);
}
