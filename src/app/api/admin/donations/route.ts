import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: donations, error } = await admin
      .from('donations')
      .select('id, user_id, amount, currency, payment_method, payment_status, bank_transfer_reference, created_at, profile:profiles(email, full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Donations query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(donations ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Donations API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
