'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
}

const healthLinks = [
  { key: 'nutrition', slug: 'nutrition' },
  { key: 'yoga', slug: 'yoga' },
  { key: 'sunyoga', slug: 'sunyoga' },
  { key: 'meditation', slug: 'meditation' },
  { key: 'powerTraining', slug: 'power-training' },
  { key: 'acupressura', slug: 'acupressura' },
];

const programLinks = [
  { label: 'Sunyoga Coach Training', slug: 'sunyoga-training' },
  { label: 'Acupressure Coach Training', slug: 'acupresura-training' },
  { label: 'Awaken Your Inner Compass', slug: 'awaken-inner-compass' },
];

export function Header({ locale, logoUrl }: HeaderProps) {
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
        <div className="shrink-0">
          <Logo locale={locale} size={60} logoUrl={logoUrl} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {/* About Dropdown */}
          <NavDropdown
            label="About"
            active={isActive('/about')}
            items={[
              { label: 'About Us', href: p('/about') },
              { label: 'Our Mission', href: p('/about/mission') },
              { label: 'Our Vision', href: p('/about/vision') },
            ]}
          />

          {/* Role Teachers Dropdown */}
          <NavDropdown
            label="Role Teachers"
            active={isActive('/role-teachers')}
            items={[
              { label: 'Meet Your Role Teachers', href: p('/role-teachers') },
              { label: 'Avalon', href: p('/role-teachers/avalon') },
              { label: 'Akasha', href: p('/role-teachers/akasha') },
              { label: 'Testimonials', href: p('/role-teachers/testimonials') },
            ]}
          />

          {/* Health Dropdown */}
          <NavDropdown
            label="Health"
            active={isActive('/health')}
            items={[
              { label: 'Overview', href: p('/health') },
              ...healthLinks.map((h) => ({
                label: h.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                href: p(`/health/${h.slug}`),
              })),
            ]}
          />

          {/* Coach Training Dropdown */}
          <NavDropdown
            label="Coach Training"
            active={isActive('/coach-training')}
            items={[
              { label: 'All Programs', href: p('/coach-training') },
              ...programLinks.map((pr) => ({
                label: pr.label,
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
            Events
          </Link>

          <Link
            href={p('/membership')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/membership') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Membership
          </Link>

          <Link
            href={p('/blog')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/blog') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Blog
          </Link>

          <Link
            href={p('/contact')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/contact') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Contact
          </Link>

          <Link
            href={p('/about/donate')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about/donate') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Donate
          </Link>

          <Link
            href={p('/about/volunteer')}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about/volunteer') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Volunteer
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
                  My Profile
                </DropdownMenuItem>
                {profile?.subscription_status === 'active' && (
                  <DropdownMenuItem onClick={() => (window.location.href = p('/members'))}>
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    Members Area
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => (window.location.href = '/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 lg:flex">
              <Link
                href={p('/login')}
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Link
                href={p('/register')}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Register
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
                      About
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/about')} label="About Us" onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/about/mission')} label="Our Mission" onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/about/vision')} label="Our Vision" onClick={() => setMobileOpen(false)} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion className="w-full">
                  <AccordionItem value="role-teachers" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      Role Teachers
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/role-teachers')} label="Meet Your Role Teachers" onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/role-teachers/avalon')} label="Avalon" onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/role-teachers/akasha')} label="Akasha" onClick={() => setMobileOpen(false)} />
                      <MobileLink href={p('/role-teachers/testimonials')} label="Testimonials" onClick={() => setMobileOpen(false)} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="health" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      Health
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/health')} label="Overview" onClick={() => setMobileOpen(false)} />
                      {healthLinks.map((h) => (
                        <MobileLink
                          key={h.slug}
                          href={p(`/health/${h.slug}`)}
                          label={h.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="coach-training" className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      Coach Training
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-4">
                      <MobileLink href={p('/coach-training')} label="All Programs" onClick={() => setMobileOpen(false)} />
                      {programLinks.map((pr) => (
                        <MobileLink key={pr.slug} href={p(`/coach-training/${pr.slug}`)} label={pr.label} onClick={() => setMobileOpen(false)} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <MobileLink href={p('/events')} label="Events" onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/membership')} label="Membership" onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/blog')} label="Blog" onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/contact')} label="Contact" onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/about/donate')} label="Donate" onClick={() => setMobileOpen(false)} />
                <MobileLink href={p('/about/volunteer')} label="Volunteer" onClick={() => setMobileOpen(false)} />

                {!user && (
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <Link
                      href={p('/login')}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-4 py-2 text-center text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      href={p('/register')}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Register
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
