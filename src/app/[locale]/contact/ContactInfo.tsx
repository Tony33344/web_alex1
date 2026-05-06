'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function ContactInfo() {
  const t = useTranslations();
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
            <h4 className="text-sm font-semibold">{t('contact.email')}</h4>
            <p className="text-sm text-muted-foreground">{settings.contact_email || 'info@infinityroleteachers.com'}</p>
          </div>
        </div>
        {settings.contact_phone && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{t('contact.phone')}</h4>
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
              <h4 className="text-sm font-semibold">{t('contact.phone2')}</h4>
              <p className="text-sm text-muted-foreground">{settings.contact_phone_2}</p>
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t('contact.address')}</h4>
            <p className="text-sm text-muted-foreground">{t('footer.company')}<br />{t('contact.country')}</p>
          </div>
        </div>

        {/* Social Media */}
        {(settings.social_instagram || settings.social_facebook || settings.social_twitter || settings.social_linkedin || settings.social_youtube) && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">{t('contact.findUs')}</h4>
            <div className="flex gap-3">
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
