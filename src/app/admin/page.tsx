'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, MessageSquare, Mail, CreditCard, FileText, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  users: number;
  blogPosts: number;
  events: number;
  contacts: number;
  subscribers: number;
  activeMembers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, blogPosts: 0, events: 0, contacts: 0, subscribers: 0, activeMembers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const [users, posts, events, contacts, subscribers, members] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      ]);
      setStats({
        users: users.count ?? 0,
        blogPosts: posts.count ?? 0,
        events: events.count ?? 0,
        contacts: contacts.count ?? 0,
        subscribers: subscribers.count ?? 0,
        activeMembers: members.count ?? 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600' },
    { label: 'Active Members', value: stats.activeMembers, icon: CreditCard, color: 'text-green-600' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: BookOpen, color: 'text-purple-600' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'text-orange-600' },
    { label: 'New Contacts', value: stats.contacts, icon: MessageSquare, color: 'text-red-600' },
    { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'New Blog Post', href: '/admin/blog/new', icon: BookOpen },
              { label: 'New Event', href: '/admin/events/new', icon: Calendar },
              { label: 'View Contacts', href: '/admin/contacts', icon: MessageSquare },
              { label: 'Manage Pages', href: '/admin/pages', icon: FileText },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <action.icon className="h-4 w-4 text-primary" />
                {action.label}
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Activity feed will appear here once the database is connected.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
