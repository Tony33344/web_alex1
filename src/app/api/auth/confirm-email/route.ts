import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { userId, phone, full_name } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Persist phone/name on the profile row (profiles trigger may race with signup data)
    const update: Record<string, string> = {};
    if (phone) update.phone = phone;
    if (full_name) update.full_name = full_name;
    if (Object.keys(update).length > 0) {
      await admin.from('profiles').update(update).eq('id', userId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
