import { createClient } from '@/lib/supabase/server';

export interface SiteSettings {
  logo?: string;
  logo_size?: string;
  logo_text_gap?: string;
  logo_text_size?: string;
  logo_bottom_gap?: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');
  
  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
  
  const settings: SiteSettings = {};
  data?.forEach((row: { key: string; value: string }) => {
    const val = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : String(row.value);
    if (row.key === 'logo') settings.logo = val;
    if (row.key === 'logo_size') settings.logo_size = val;
    if (row.key === 'logo_text_gap') settings.logo_text_gap = val;
    if (row.key === 'logo_text_size') settings.logo_text_size = val;
    if (row.key === 'logo_bottom_gap') settings.logo_bottom_gap = val;
  });
  
  return settings;
}
