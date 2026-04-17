'use client';

import { useEffect, useState } from 'react';
import { Crown, Mail, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Member {
  id: string;
  full_name: string | null;
  email: string;
  subscription_status: string;
  subscription_plan: string | null;
  subscription_end_date: string | null;
  created_at: string;
  phone: string | null;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/admin/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(m =>
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMembers = members.filter(m => m.subscription_status === 'active');
  const yearlyMembers = members.filter(m => m.subscription_plan === 'yearly' && m.subscription_status === 'active');
  const monthlyMembers = members.filter(m => m.subscription_plan === 'monthly' && m.subscription_status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Members
        </h1>
        <p className="text-muted-foreground">Manage and view all active members</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yearly Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Activation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.subscription_status !== 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchMembers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No members found</div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name || 'Unknown'}</span>
                      {member.subscription_status === 'active' ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-500 text-white">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span>📱 {member.phone}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </span>
                      {member.subscription_end_date && member.subscription_status === 'active' && (
                        <span>
                          Renews {new Date(member.subscription_end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {member.subscription_plan && (
                      <Badge variant={member.subscription_plan === 'yearly' ? 'default' : 'outline'}>
                        {member.subscription_plan.charAt(0).toUpperCase() + member.subscription_plan.slice(1)}
                      </Badge>
                    )}
                    {member.subscription_status !== 'active' ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const res = await fetch('/api/admin/members/activate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: member.id, plan: member.subscription_plan || 'monthly' }),
                          });
                          if (res.ok) fetchMembers();
                          else alert('Failed to activate');
                        }}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!confirm('Deactivate this member?')) return;
                          const res = await fetch('/api/admin/members/activate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: member.id, action: 'deactivate' }),
                          });
                          if (res.ok) fetchMembers();
                          else alert('Failed to deactivate');
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
