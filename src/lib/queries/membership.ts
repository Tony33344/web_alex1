import { createClient } from '@/lib/supabase/server';
import type { MembershipPlan } from '@/types/database';

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getMembershipPlans error:', error.message);
    return [];
  }
  return (data as MembershipPlan[]) ?? [];
}
