'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers((data as Profile[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleAdmin(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const supabase = createClient();
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole as Profile['role'] } : u));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.full_name || 'No name'}</span>
                    <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    <Badge variant={user.subscription_status === 'active' ? 'default' : 'outline'}>{user.subscription_status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                  {user.role !== 'super_admin' && (
                    <Button variant="ghost" size="sm" onClick={() => toggleAdmin(user.id, user.role)} title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                      {user.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4" />}
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
