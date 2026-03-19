'use client';

import { useEffect, useState } from 'react';
import { Mail, Eye, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { ContactSubmission } from '@/types/database';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      setContacts((data as ContactSubmission[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from('contact_submissions').update({ status }).eq('id', id);
    setContacts(contacts.map(c => c.id === id ? { ...c, status: status as ContactSubmission['status'] } : c));
  }

  async function deleteContact(id: string) {
    if (!confirm('Delete this message?')) return;
    const supabase = createClient();
    await supabase.from('contact_submissions').delete().eq('id', id);
    setContacts(contacts.filter(c => c.id !== id));
  }

  const statusColor = (s: string) => s === 'new' ? 'destructive' : s === 'read' ? 'default' : s === 'replied' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Submissions</h1>
        <p className="text-muted-foreground">Manage incoming messages</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : contacts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No contact submissions yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{contact.name}</h3>
                      <Badge variant={statusColor(contact.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>{contact.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.email} {contact.phone && `· ${contact.phone}`}</p>
                    <p className="text-sm font-medium text-primary">{contact.subject}</p>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {contact.status === 'new' && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(contact.id, 'read')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(contact.id, 'replied')}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(contact.id, 'archived')}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
