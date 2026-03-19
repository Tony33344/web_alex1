'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Users, Heart, GraduationCap, Calendar, BookOpen,
  CreditCard, MessageSquare, Mail, Settings, Image, Globe, Star, BarChart3, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import '@/app/globals.css';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'Teachers', href: '/admin/teachers', icon: Users },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Health', href: '/admin/health', icon: Heart },
  { label: 'Programs', href: '/admin/programs', icon: GraduationCap },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Blog', href: '/admin/blog', icon: BookOpen },
  { label: 'Membership', href: '/admin/membership', icon: CreditCard },
  { label: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Translations', href: '/admin/translations', icon: Globe },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform lg:translate-x-0 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/admin" className="text-lg font-bold text-primary">
              Admin Dashboard
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <Link
              href="/en"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Admin Panel</span>
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
