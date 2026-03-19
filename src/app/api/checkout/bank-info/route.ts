import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['bank_name', 'bank_iban', 'bank_bic', 'bank_account_holder']);

  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: unknown }) => {
    settings[row.key] = String(row.value);
  });

  return NextResponse.json(settings);
}
