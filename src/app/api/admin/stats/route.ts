import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();
    const [users, posts, events, contacts, subscribers, members] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('blog_posts').select('id', { count: 'exact', head: true }),
      admin.from('events').select('id', { count: 'exact', head: true }),
      admin.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    ]);

    return NextResponse.json({
      users: users.count ?? 0,
      blogPosts: posts.count ?? 0,
      events: events.count ?? 0,
      contacts: contacts.count ?? 0,
      subscribers: subscribers.count ?? 0,
      activeMembers: members.count ?? 0,
    });
  } catch {
    return NextResponse.json({ users: 0, blogPosts: 0, events: 0, contacts: 0, subscribers: 0, activeMembers: 0 });
  }
}
