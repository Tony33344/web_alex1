import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_BANK_INFO = {
  bank_name: 'UBS Switzerland AG',
  bank_iban: 'CH93 0076 2011 6238 5295 7',
  bank_bic: 'AEAGCH22',
  bank_account_holder: 'AMS4EVER AG',
};

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', ['bank_name', 'bank_iban', 'bank_bic', 'bank_account_holder']);

    const settings: Record<string, string> = {};
    (data ?? []).forEach((row: { key: string; value: unknown }) => {
      const val = String(row.value).replace(/"/g, '').trim();
      if (val) settings[row.key] = val;
    });

    // Merge with defaults for any missing values
    const result = {
      bank_name: settings.bank_name || DEFAULT_BANK_INFO.bank_name,
      bank_iban: settings.bank_iban || DEFAULT_BANK_INFO.bank_iban,
      bank_bic: settings.bank_bic || DEFAULT_BANK_INFO.bank_bic,
      bank_account_holder: settings.bank_account_holder || DEFAULT_BANK_INFO.bank_account_holder,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Bank info error:', err);
    // Return defaults on error so UI doesn't break
    return NextResponse.json(DEFAULT_BANK_INFO);
  }
}
