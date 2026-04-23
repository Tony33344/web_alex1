'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ContactInfo() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Email</h4>
            <p className="text-sm text-muted-foreground">{settings.contact_email || 'info@infinityroleteachers.com'}</p>
          </div>
        </div>
        {settings.contact_phone && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Phone</h4>
              <p className="text-sm text-muted-foreground">{settings.contact_phone}</p>
            </div>
          </div>
        )}
        {settings.contact_phone_2 && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Phone (2)</h4>
              <p className="text-sm text-muted-foreground">{settings.contact_phone_2}</p>
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Address</h4>
            <p className="text-sm text-muted-foreground">AMS4EVER AG<br />Switzerland</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
