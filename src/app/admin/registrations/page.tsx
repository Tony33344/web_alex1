'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle, CreditCard, Building2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  amount: number | null;
  currency: string;
  bank_transfer_reference: string | null;
  confirmed_at: string | null;
  created_at: string;
  event?: { id: string; title_en: string; slug: string; start_date: string; price: number | null; currency: string };
  profile?: { email: string; full_name: string | null };
}

interface Enrollment {
  id: string;
  program_id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  amount: number | null;
  currency: string;
  bank_transfer_reference: string | null;
  confirmed_at: string | null;
  created_at: string;
  program?: { id: string; name_en: string; slug: string; price: number | null; currency: string };
  profile?: { email: string; full_name: string | null };
}

type Tab = 'events' | 'programs';

export default function AdminRegistrationsPage() {
  const [tab, setTab] = useState<Tab>('events');
  const [regs, setRegs] = useState<Registration[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/registrations')
      .then(r => r.json())
      .then(d => {
        setRegs(d.eventRegistrations ?? []);
        setEnrollments(d.programEnrollments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function confirmPayment(table: string, id: string) {
    const res = await fetch('/api/admin/registrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table,
        id,
        data: {
          payment_status: 'paid',
          status: table === 'event_registrations' ? 'confirmed' : 'confirmed',
          confirmed_at: new Date().toISOString(),
        },
      }),
    });
    if (res.ok) {
      if (table === 'event_registrations') {
        setRegs(regs.map(r => r.id === id ? { ...r, payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() } : r));
      } else {
        setEnrollments(enrollments.map(e => e.id === id ? { ...e, payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() } : e));
      }
    }
  }

  async function cancelRegistration(table: string, id: string) {
    const res = await fetch('/api/admin/registrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data: { status: 'cancelled', payment_status: 'refunded' } }),
    });
    if (res.ok) {
      if (table === 'event_registrations') {
        setRegs(regs.map(r => r.id === id ? { ...r, status: 'cancelled', payment_status: 'refunded' } : r));
      } else {
        setEnrollments(enrollments.map(e => e.id === id ? { ...e, status: 'cancelled', payment_status: 'refunded' } : e));
      }
    }
  }

  const paymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
      case 'pending': return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'free': return <Badge variant="secondary">Free</Badge>;
      case 'refunded': return <Badge variant="destructive">Refunded</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const methodIcon = (method: string | null) => {
    if (method === 'bank_transfer') return <Building2 className="h-3.5 w-3.5 text-blue-600" />;
    if (method === 'stripe') return <CreditCard className="h-3.5 w-3.5 text-purple-600" />;
    return <Ticket className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const pendingEvents = regs.filter(r => r.payment_status === 'pending').length;
  const pendingPrograms = enrollments.filter(e => e.payment_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrations & Orders</h1>
        <p className="text-muted-foreground">
          Manage event bookings and program enrollments
          {(pendingEvents + pendingPrograms) > 0 && (
            <span className="ml-2 text-amber-600 font-medium">
              — {pendingEvents + pendingPrograms} pending confirmation
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'events' ? 'default' : 'outline'} onClick={() => setTab('events')} className="gap-2">
          <Ticket className="h-4 w-4" /> Event Registrations ({regs.length})
        </Button>
        <Button variant={tab === 'programs' ? 'default' : 'outline'} onClick={() => setTab('programs')} className="gap-2">
          <CreditCard className="h-4 w-4" /> Program Enrollments ({enrollments.length})
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tab === 'events' ? (
        <div className="space-y-3">
          {regs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No event registrations yet.</CardContent></Card>
          ) : regs.map(reg => (
            <Card key={reg.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{reg.event?.title_en || 'Unknown Event'}</h3>
                    {paymentBadge(reg.payment_status)}
                    <Badge variant="outline">{reg.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{reg.profile?.full_name || reg.profile?.email || 'Unknown user'}</span>
                    <span className="flex items-center gap-1">{methodIcon(reg.payment_method)}{reg.payment_method === 'bank_transfer' ? 'Bank Transfer' : reg.payment_method === 'stripe' ? 'Stripe' : 'Free'}</span>
                    {reg.amount && <span>{reg.currency} {reg.amount}</span>}
                    {reg.bank_transfer_reference && <span>Ref: {reg.bank_transfer_reference}</span>}
                    <span>{new Date(reg.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {reg.payment_status === 'pending' && (
                    <Button size="sm" onClick={() => confirmPayment('event_registrations', reg.id)} className="gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Confirm Payment
                    </Button>
                  )}
                  {reg.status !== 'cancelled' && (
                    <Button size="sm" variant="ghost" onClick={() => cancelRegistration('event_registrations', reg.id)}>
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No program enrollments yet.</CardContent></Card>
          ) : enrollments.map(enr => (
            <Card key={enr.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{enr.program?.name_en || 'Unknown Program'}</h3>
                    {paymentBadge(enr.payment_status)}
                    <Badge variant="outline">{enr.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{enr.profile?.full_name || enr.profile?.email || 'Unknown user'}</span>
                    <span className="flex items-center gap-1">{methodIcon(enr.payment_method)}{enr.payment_method === 'bank_transfer' ? 'Bank Transfer' : enr.payment_method === 'stripe' ? 'Stripe' : 'Free'}</span>
                    {enr.amount && <span>{enr.currency} {enr.amount}</span>}
                    {enr.bank_transfer_reference && <span>Ref: {enr.bank_transfer_reference}</span>}
                    <span>{new Date(enr.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {enr.payment_status === 'pending' && (
                    <Button size="sm" onClick={() => confirmPayment('program_enrollments', enr.id)} className="gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Confirm Payment
                    </Button>
                  )}
                  {enr.status !== 'cancelled' && (
                    <Button size="sm" variant="ghost" onClick={() => cancelRegistration('program_enrollments', enr.id)}>
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
