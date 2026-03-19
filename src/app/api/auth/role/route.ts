import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ role: null }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return NextResponse.json({ role: null });
    return NextResponse.json({ role: data.role });
  } catch {
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
