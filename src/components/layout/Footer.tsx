'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Phone, Mail, Heart } from 'lucide-react';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
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
            src="https://nchbiryeykludxrrdfaw.supabase.co/storage/v1/object/public/images/pages/home/logo%20small%20transparent.png"
            alt="Infinity Role Teachers"
            className="h-18 w-auto"
          />
          <p className="text-sm leading-relaxed text-background/70">
            Transform your life through holistic wellness and coaching. Discover your infinite potential with our expert Role Teachers.
          </p>
          <div className="flex gap-3">
            <SocialIcon href="#" icon={<Instagram className="h-4 w-4" />} />
            <SocialIcon href="#" icon={<Facebook className="h-4 w-4" />} />
            <SocialIcon href="#" icon={<Twitter className="h-4 w-4" />} />
            <SocialIcon href="#" icon={<Linkedin className="h-4 w-4" />} />
            <SocialIcon href="#" icon={<Youtube className="h-4 w-4" />} />
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">Quick Links</h3>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href={p('/')} className="hover:text-background transition-colors">About</Link></li>
            <li><Link href={p('/health')} className="hover:text-background transition-colors">Health</Link></li>
            <li><Link href={p('/coach-training')} className="hover:text-background transition-colors">Coach Training</Link></li>
            <li><Link href={p('/events')} className="hover:text-background transition-colors">Events</Link></li>
            <li><Link href={p('/blog')} className="hover:text-background transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Column 3 — Programs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">Programs</h3>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href={p('/coach-training/sunyoga-training')} className="hover:text-background transition-colors">Sunyoga Coach Training</Link></li>
            <li><Link href={p('/coach-training/acupresura-training')} className="hover:text-background transition-colors">Acupressure Coach Training</Link></li>
            <li><Link href={p('/coach-training/awaken-inner-compass')} className="hover:text-background transition-colors">Awaken Your Inner Compass</Link></li>
          </ul>
        </div>

        {/* Column 4 — Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90">Contact</h3>
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
              Donate
            </Link>
            <Link
              href={p('/contact')}
              className="inline-block rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-background/50 sm:flex-row sm:px-6 lg:px-8">
          <span>&copy; {year} Infinity Role Teachers. All rights reserved.</span>
          <span className="font-medium text-background/60">AMS4EVER AG</span>
          <div className="flex gap-4">
            <Link href={p('/support')} className="hover:text-background transition-colors">Support</Link>
            <Link href={p('/terms')} className="hover:text-background transition-colors">Terms &amp; Conditions</Link>
            <Link href={p('/privacy')} className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link href={p('/disclaimer')} className="hover:text-background transition-colors">Disclaimer</Link>
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
