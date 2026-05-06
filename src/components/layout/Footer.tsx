'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Phone, Mail, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FooterProps {
  locale: string;
  logoUrl?: string;
}

export function Footer({ locale, logoUrl }: FooterProps) {
  const t = useTranslations();
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto border-t bg-foreground text-background">
      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Column 1 — Brand */}
        <div className="space-y-4">
          <img
            src={logoUrl || "https://infinityroleteachers.com/logo/logo.jpeg"}
            alt={t('home.newsletterAltText')}
            className="h-18 w-auto"
          />
          <p className="text-sm leading-relaxed text-background/70">
            {t('home.stayUpdated')}
          </p>
          <div className="flex gap-3">
            {settings.social_instagram && <SocialIcon href={settings.social_instagram} icon={<Instagram className="h-4 w-4" />} />}
            {settings.social_facebook && <SocialIcon href={settings.social_facebook} icon={<Facebook className="h-4 w-4" />} />}
            {settings.social_twitter && <SocialIcon href={settings.social_twitter} icon={<Twitter className="h-4 w-4" />} />}
            {settings.social_linkedin && <SocialIcon href={settings.social_linkedin} icon={<Linkedin className="h-4 w-4" />} />}
            {settings.social_youtube && <SocialIcon href={settings.social_youtube} icon={<Youtube className="h-4 w-4" />} />}
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href={p('/')} className="hover:text-background transition-colors">{t('navigation.about')}</Link></li>
            <li><Link href={p('/health')} className="hover:text-background transition-colors">{t('navigation.health')}</Link></li>
            <li><Link href={p('/coach-training')} className="hover:text-background transition-colors">{t('navigation.coachTraining')}</Link></li>
            <li><Link href={p('/events')} className="hover:text-background transition-colors">{t('navigation.events')}</Link></li>
            <li><Link href={p('/blog')} className="hover:text-background transition-colors">{t('navigation.blog')}</Link></li>
          </ul>
        </div>

        {/* Column 3 — Programs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">{t('footer.programs')}</h3>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href={p('/coach-training/sunyoga-training')} className="hover:text-background transition-colors">{t('programs.sunyogaTraining')}</Link></li>
            <li><Link href={p('/coach-training/acupresura-training')} className="hover:text-background transition-colors">{t('programs.acupressureTraining')}</Link></li>
            <li><Link href={p('/coach-training/awaken-inner-compass')} className="hover:text-background transition-colors">{t('home.awakenInnerCompass')}</Link></li>
          </ul>
        </div>

        {/* Column 4 — Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">{t('navigation.contact')}</h3>
          <ul className="space-y-2 text-sm text-background/70">
            <li className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {settings.contact_email || 'info@infinityroleteachers.com'}
            </li>
            {settings.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {settings.contact_phone}
              </li>
            )}
            {settings.contact_phone_2 && (
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {settings.contact_phone_2}
              </li>
            )}
          </ul>
          <div className="flex gap-2">
            <Link
              href={p('/about/donate')}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-600" />
              {t('common.donate')}
            </Link>
            <Link
              href={p('/contact')}
              className="inline-block rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </div>

      {/* Social Media Bar */}
      {(settings.social_instagram || settings.social_facebook || settings.social_twitter || settings.social_linkedin || settings.social_youtube) && (
        <div className="border-t border-background/10">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {settings.social_instagram && <SocialIcon href={settings.social_instagram} icon={<Instagram className="h-5 w-5" />} />}
            {settings.social_facebook && <SocialIcon href={settings.social_facebook} icon={<Facebook className="h-5 w-5" />} />}
            {settings.social_twitter && <SocialIcon href={settings.social_twitter} icon={<Twitter className="h-5 w-5" />} />}
            {settings.social_linkedin && <SocialIcon href={settings.social_linkedin} icon={<Linkedin className="h-5 w-5" />} />}
            {settings.social_youtube && <SocialIcon href={settings.social_youtube} icon={<Youtube className="h-5 w-5" />} />}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-background/50 sm:flex-row sm:px-6 lg:px-8">
          <span>{t('footer.rights', { year })}</span>
          <span className="font-medium text-background/60">{t('footer.company')}</span>
          <div className="flex gap-4">
            <Link href={p('/support')} className="hover:text-background transition-colors">{t('common.support')}</Link>
            <Link href={p('/terms')} className="hover:text-background transition-colors">{t('footer.terms')}</Link>
            <Link href={p('/privacy')} className="hover:text-background transition-colors">{t('footer.privacy')}</Link>
            <Link href={p('/disclaimer')} className="hover:text-background transition-colors">{t('common.disclaimer')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
    >
      {icon}
    </a>
  );
}
