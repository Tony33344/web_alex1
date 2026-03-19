'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(
          (Array.isArray(data) ? data : []).map((s: Record<string, unknown>) => ({
            id: s.id as string,
            key: s.key as string,
            value: typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : JSON.stringify(s.value).replace(/^"|"$/g, ''),
            description: s.description as string | null,
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function updateValue(key: string, value: string) {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    await Promise.all(settings.map(s =>
      fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, value: JSON.stringify(s.value) }),
      })
    ));
    setMessage('Settings saved successfully!');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }

  const groups = {
    'General': ['site_name', 'site_description', 'default_currency'],
    'Contact': ['contact_email', 'contact_phone'],
    'Social Media': ['social_instagram', 'social_facebook', 'social_twitter', 'social_linkedin', 'social_youtube'],
    'Bank Details': ['bank_company', 'bank_iban', 'bank_bic', 'bank_name'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All
        </Button>
      </div>

      {message && <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        Object.entries(groups).map(([groupName, keys]) => (
          <Card key={groupName}>
            <CardHeader><CardTitle className="text-lg">{groupName}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {keys.map((key) => {
                const setting = settings.find(s => s.key === key);
                if (!setting) return null;
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{setting.description || setting.key}</Label>
                    <Input
                      value={setting.value}
                      onChange={(e) => updateValue(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
