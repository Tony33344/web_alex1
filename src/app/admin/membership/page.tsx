'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MembershipPlan } from '@/types/database';

export default function AdminMembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/membership')
      .then(r => r.json())
      .then(data => { setPlans(Array.isArray(data) ? data as MembershipPlan[] : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deletePlan(id: string) {
    if (!confirm('Delete this plan?')) return;
    await fetch('/api/admin/membership', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPlans(plans.filter(p => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Membership Plans</h1><p className="text-muted-foreground">Manage subscription plans</p></div>
        <Link href="/admin/membership/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Plan</Button></Link>
      </div>
      {loading ? <p className="text-muted-foreground">Loading...</p> : plans.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No membership plans yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{plan.name_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge>
                    {plan.is_popular && <Badge variant="outline">Popular</Badge>}
                    <span className="capitalize">{plan.plan_type}</span>
                    <span>CHF {plan.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/membership/${plan.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
