import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TABLES = [
  'teachers', 'blog_posts', 'events', 'programs', 'health_categories',
  'testimonials', 'pages', 'sections', 'media', 'translation_overrides',
  'case_studies', 'membership_plans', 'site_settings', 'contact_submissions',
  'newsletter_subscribers', 'profiles', 'event_registrations',
];

function isAllowed(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const orderBy = searchParams.get('orderBy') || 'created_at';
  const orderDir = searchParams.get('orderDir') === 'asc';
  const eq = searchParams.get('eq');
  const eqVal = searchParams.get('eqVal');
  const id = searchParams.get('id');
  const select = searchParams.get('select') || '*';

  if (!table || !isAllowed(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin.from(table).select(select);

  if (id) {
    query = query.eq('id', id);
  } else {
    if (eq && eqVal) {
      query = query.eq(eq, eqVal);
    }
    query = query.order(orderBy, { ascending: orderDir });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(id ? (data?.[0] ?? null) : (data ?? []));
}

export async function POST(request: Request) {
  const { table, data: payload } = await request.json();
  if (!table || !isAllowed(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from(table).insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { table, id, data: payload } = await request.json();
  if (!table || !isAllowed(table) || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from(table).update(payload).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { table, id } = await request.json();
  if (!table || !isAllowed(table) || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
