import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Generate bank transfer reference
    const bankRef = `MEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Update profile with pending subscription. Do NOT touch stripe_customer_id — that field is reserved
    // for real Stripe customer IDs (starting with 'cus_'); overwriting it breaks future Stripe checkouts.
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_plan: plan,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Membership bank transfer error:', error);
      return NextResponse.json({ error: 'Failed to create bank transfer request: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reference: bankRef });
  } catch (err) {
    console.error('Membership bank transfer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
