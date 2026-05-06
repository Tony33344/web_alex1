'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Crown } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HeaderProps {
  locale: string;
  logoUrl?: string;
  logoSize?: number;
  logoTextGap?: number;
  logoTextSize?: number;
  logoBottomGap?: number;
  programs?: { slug: string; label: string }[];
  teachers?: { slug: string; label: string }[];
  healthCategories?: { slug: string; label: string }[];
}

const defaultProgramLinks = [
  { label: 'programs.sunyogaTraining', slug: 'sunyoga-training' },
  { label: 'programs.acupressureTraining', slug: 'acupresura-training' },
  { label: 'programs.awakenInnerCompass', slug: 'awaken-inner-compass' },
];

export function Header({ locale, logoUrl, logoSize = 70, logoTextGap = 0, logoTextSize = 14, logoBottomGap = 0, programs, teachers, healthCategories }: HeaderProps) {
  const t = useTranslations();
  const programLinks = programs && programs.length > 0 ? programs : defaultProgramLinks;
  const teacherLinks = teachers && teachers.length > 0 ? teachers : [];
  const dynamicHealthLinks = healthCategories && healthCategories.length > 0 ? healthCategories : [];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const p = (path: string) => `/${locale}${path}`;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = p('/login');
  }

  const isActive = (path: string) => pathname === p(path) || pathname.startsWith(p(path) + '/');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80'
          : 'bg-background'
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="shrink-0" style={{ marginBottom: `${logoBottomGap}px` }}>
          <Logo locale={locale} size={logoSize} logoUrl={logoUrl} textGap={logoTextGap} textSize={logoTextSize} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {/* About Dropdown */}
          <NavDropdown
            label={t('header.about')}
            active={isActive('/about')}
            items={[
              { label: t('navigation.about'), href: p('/about') },
              { label: t('home.ourMission'), href: p('/about/mission') },
              { label: t('home.ourVision'), href: p('/about/vision') },
            ]}
          />

          {/* Role Teachers Dropdown */}
          <NavDropdown
            label={t('header.roleTeachers')}
            active={isActive('/role-teachers')}
            items={[
              { label: t('header.meetTeachers'), href: p('/role-teachers') },
              ...teacherLinks.map((t) => ({
                label: t.label,
                href: p(`/role-teachers/${t.slug}`),
              })),
              { label: t('navigation.testimonials'), href: p('/role-teachers/testimonials') },
            ]}
          />

          {/* Health Dropdown */}
          <NavDropdown
            label={t('header.health')}
            active={isActive('/health')}
            items={[
              { label: t('header.overview'), href: p('/health') },
              ...dynamicHealthLinks.map((h) => ({
                label: h.label,
                href: p(`/health/${h.slug}`),
              })),
            ]}
          />

          {/* Coach Training Dropdown */}
          <NavDropdown
            label={t('header.coachTraining')}
            active={isActive('/coach-training')}
            items={[
              { label: t('header.allPrograms'), href: p('/coach-training') },
              ...programLinks.map((pr) => ({
                label: pr.label.includes('.') ? t(pr.label) : pr.label,
                href: p(`/coach-training/${pr.slug}`),
              })),
            ]}
          />

          <Link
            href={p('/events')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/events') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.events')}
          </Link>

          <Link
            href={p('/membership')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/membership') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.membership')}
          </Link>

          <Link
            href={p('/blog')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/blog') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.blog')}
          </Link>

          <Link
            href={p('/contact')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/contact') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.contact')}
          </Link>

          <Link
            href={p('/about/donate')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about/donate') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.donate')}
          </Link>

          <Link
            href={p('/about/volunteer')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about/volunteer') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {t('header.volunteer')}
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />

          {/* Auth / User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-1 focus:outline-none hover:bg-muted/60 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate pr-2">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => (window.location.href = p('/welcome'))}>
                  <User className="mr-2 h-4 w-4" />
                  {t('header.myProfile')}
                </DropdownMenuItem>
                {profile?.subscription_status === 'active' && (
                  <DropdownMenuItem onClick={() => (window.location.href = p('/members'))}>
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    {t('header.membersArea')}
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => (window.location.href = '/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('header.adminDashboard')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.logOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 lg:flex">
              <Link
                href={p('/login')}
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              >
                {t('navigation.login')}
              </Link>
              <Link
                href={p('/register')}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('navigation.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="lg:hidden rounded-md p-2 hover:bg-accent">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="mt-8 flex flex-col gap-2">
                <Accordion className="w-full">
                  <AccordionItem value="about" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      {t('header.about')}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/about')} label={t('navigation.about')} onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/about/mission')} label={t('home.ourMission')} onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/about/vision')} label={t('home.ourVision')} onClick={() => setMobileOpen(false)} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion className="w-full">
                  <AccordionItem value="role-teachers" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      {t('header.roleTeachers')}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/role-teachers')} label={t('header.meetTeachers')} onClick={() => setMobileOpen(false)} />
                      {teacherLinks.map((t) => (
                        <MobileLink key={t.slug} href={p(`/role-teachers/${t.slug}`)} label={t.label} onClick={() => setMobileOpen(false)} />
                      ))}
                      <MobileLink href={p('/role-teachers/testimonials')} label={t('navigation.testimonials')} onClick={() => setMobileOpen(false)} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="health" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      {t('header.health')}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/health')} label={t('header.overview')} onClick={() => setMobileOpen(false)} />
                      {dynamicHealthLinks.map((h) => (
                        <MobileLink
                          key={h.slug}
                          href={p(`/health/${h.slug}`)}
                          label={h.label}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="coach-training" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      {t('header.coachTraining')}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/coach-training')} label={t('header.allPrograms')} onClick={() => setMobileOpen(false)} />
                      {programLinks.map((pr) => (
                        <MobileLink key={pr.slug} href={p(`/coach-training/${pr.slug}`)} label={pr.label.includes('.') ? t(pr.label) : pr.label} onClick={() => setMobileOpen(false)} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <MobileLink href={p('/events')} label={t('header.events')} onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/membership')} label={t('header.membership')} onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/blog')} label={t('header.blog')} onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/contact')} label={t('header.contact')} onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/about/donate')} label={t('header.donate')} onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/about/volunteer')} label={t('header.volunteer')} onClick={() => setMobileOpen(false)} />

                {!user && (
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <Link
                      href={p('/login')}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-4 py-2 text-center text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                    >
                      {t('navigation.login')}
                    </Link>
                    <Link
                      href={p('/register')}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {t('navigation.register')}
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ── Sub-components ── */

function NavDropdown({
  label,
  active,
  items,
}: {
  label: string;
  active: boolean;
  items: { label: string; href: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none ${
          active ? 'text-primary' : 'text-foreground/70'
        }`}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
    >
      {label}
    </Link>
  );
}
