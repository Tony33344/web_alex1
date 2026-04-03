'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MembershipPlan } from '@/types/database';

export default function NewMembershipPlanPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Partial<MembershipPlan>>({
    name_en: '',
    name_de: '',
    name_it: '',
    name_fr: '',
    name_hi: '',
    name_si: '',
    description_en: '',
    description_de: '',
    description_it: '',
    description_fr: '',
    description_hi: '',
    description_si: '',
    plan_type: 'monthly',
    price: 0,
    currency: 'CHF',
    stripe_price_id: '',
    features: [],
    is_active: true,
    is_popular: false,
    display_order: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    if (res.ok) {
      router.push('/admin/membership');
    } else {
      alert('Failed to create plan');
      setSaving(false);
    }
  }

  function updateFeature(index: number, value: string) {
    const newFeatures = [...(plan.features || [])];
    newFeatures[index] = value;
    setPlan({ ...plan, features: newFeatures });
  }

  function addFeature() {
    setPlan({ ...plan, features: [...(plan.features || []), ''] });
  }

  function removeFeature(index: number) {
    const newFeatures = [...(plan.features || [])];
    newFeatures.splice(index, 1);
    setPlan({ ...plan, features: newFeatures });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/membership">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Membership Plan</h1>
          <p className="text-muted-foreground">Create a new subscription plan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input id="name_en" value={plan.name_en || ''} onChange={e => setPlan({ ...plan, name_en: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_type">Plan Type *</Label>
                <select
                  id="plan_type"
                  value={plan.plan_type}
                  onChange={e => setPlan({ ...plan, plan_type: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" value={plan.price || ''} onChange={e => setPlan({ ...plan, price: parseFloat(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input id="currency" value={plan.currency || 'CHF'} onChange={e => setPlan({ ...plan, currency: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input id="display_order" type="number" value={plan.display_order || ''} onChange={e => setPlan({ ...plan, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
              <Input id="stripe_price_id" value={plan.stripe_price_id || ''} onChange={e => setPlan({ ...plan, stripe_price_id: e.target.value })} placeholder="price_xxxxxxxxxxxxx" />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={plan.is_active} onChange={e => setPlan({ ...plan, is_active: e.target.checked })} className="h-4 w-4 rounded border-primary" />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={plan.is_popular} onChange={e => setPlan({ ...plan, is_popular: e.target.checked })} className="h-4 w-4 rounded border-primary" />
                <span>Popular</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localized Names</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="name_de">German</Label><Input id="name_de" value={plan.name_de || ''} onChange={e => setPlan({ ...plan, name_de: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="name_it">Italian</Label><Input id="name_it" value={plan.name_it || ''} onChange={e => setPlan({ ...plan, name_it: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="name_fr">French</Label><Input id="name_fr" value={plan.name_fr || ''} onChange={e => setPlan({ ...plan, name_fr: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="name_hi">Hindi</Label><Input id="name_hi" value={plan.name_hi || ''} onChange={e => setPlan({ ...plan, name_hi: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="name_si">Sinhala</Label><Input id="name_si" value={plan.name_si || ''} onChange={e => setPlan({ ...plan, name_si: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Features</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>Add Feature</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(plan.features || []).map((feature, idx) => (
              <div key={idx} className="flex gap-2">
                <Input value={feature} onChange={e => updateFeature(idx, e.target.value)} placeholder="Feature description" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(idx)}>Remove</Button>
              </div>
            ))}
            {(plan.features || []).length === 0 && <p className="text-muted-foreground text-sm">No features added</p>}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Plan'}</Button>
          <Link href="/admin/membership"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
