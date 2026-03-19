import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validators';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', parsed.data.email)
      .single();

    if (existing) {
      if (!existing.is_active) {
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, unsubscribed_at: null })
          .eq('id', existing.id);
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: parsed.data.email,
      is_active: true,
      preferred_language: 'en',
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
