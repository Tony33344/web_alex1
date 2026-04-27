'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Get logo settings with defaults
  const getSetting = (key: string, defaultValue: string) => {
    const s = settings.find(s => s.key === key);
    return s ? s.value : defaultValue;
  };

  const logoSize = parseInt(getSetting('logo_size', '70')) || 70;
  const logoTextGap = parseInt(getSetting('logo_text_gap', '0')) || 0;
  const logoTextSize = getSetting('logo_text_size', '14');
  const logoBottomGap = parseInt(getSetting('logo_bottom_gap', '0')) || 0;
  const logoUrl = getSetting('logo', '');

  const groups = {
    'General': ['site_name', 'site_description', 'default_currency'],
    'Contact': ['contact_email', 'contact_phone', 'contact_phone_2'],
    'Social Media': ['social_instagram', 'social_facebook', 'social_twitter', 'social_linkedin', 'social_youtube'],
    'Bank Details': ['bank_company', 'bank_iban', 'bank_bic', 'bank_name'],
    'Logo': ['logo', 'logo_size', 'logo_text_gap', 'logo_text_size', 'logo_bottom_gap'],
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
              {groupName === 'Logo' && (
                <div className="mb-6 rounded-lg border bg-muted/50 p-6">
                  <Label className="mb-3 block text-xs font-medium text-muted-foreground">Preview</Label>
                  <div className="flex flex-col items-center">
                    <img
                      src={logoUrl || "/logo/logo.jpeg"}
                      alt="Logo Preview"
                      width={logoSize}
                      height={logoSize}
                      className="rounded-full object-cover"
                      style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                    />
                    <span
                      className="whitespace-nowrap font-semibold tracking-tight text-foreground"
                      style={{
                        fontSize: `${logoTextSize}px`,
                        marginTop: `${logoTextGap}px`,
                      }}
                    >
                      Infinity Role Teachers
                    </span>
                    <div
                      className="w-full border-t border-dashed border-muted-foreground/30"
                      style={{ marginTop: `${logoBottomGap}px` }}
                    />
                  </div>
                </div>
              )}
              {keys.map((key) => {
                const setting = settings.find(s => s.key === key);
                if (!setting) return null;
                
                // Special rendering for logo numeric settings
                if (key === 'logo_size') {
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">{setting.description || 'Logo Size (pixels)'}</Label>
                        <Badge variant="secondary">{logoSize}px</Badge>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="120"
                        value={logoSize}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>40px</span>
                        <span>120px</span>
                      </div>
                    </div>
                  );
                }
                
                if (key === 'logo_text_gap') {
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">{setting.description || 'Text Gap (pixels)'}</Label>
                        <Badge variant="secondary">{logoTextGap > 0 ? `+${logoTextGap}px` : `${logoTextGap}px`}</Badge>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="20"
                        value={logoTextGap}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-10px (closer)</span>
                        <span>+20px (further)</span>
                      </div>
                    </div>
                  );
                }
                
                if (key === 'logo_text_size') {
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">{setting.description || 'Text Size (pixels)'}</Label>
                        <Badge variant="secondary">{logoTextSize}px</Badge>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={parseInt(logoTextSize) || 14}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10px</span>
                        <span>24px</span>
                      </div>
                    </div>
                  );
                }
                
                if (key === 'logo_bottom_gap') {
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">{setting.description || 'Gap under text to hero (pixels)'}</Label>
                        <Badge variant="secondary">{logoBottomGap}px</Badge>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="30"
                        value={logoBottomGap}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-10px (closer)</span>
                        <span>+30px (further)</span>
                      </div>
                    </div>
                  );
                }
                
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
