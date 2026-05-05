import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, plan, action } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    if (action === 'deactivate') {
      const { error } = await admin
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Activate — compute end date based on plan
    const now = new Date();
    const endDate = new Date(now);
    if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const { error } = await admin
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan || 'monthly',
        subscription_end_date: endDate.toISOString(),
      })
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send membership confirmation email
    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      const { data: { user: memberUser } } = await admin.auth.admin.getUserById(userId);
      const recipientEmail = profile?.email || memberUser?.email;
      if (recipientEmail) {
        const userName = profile?.full_name || recipientEmail.split('@')[0] || 'there';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const emailContent = prepareEmail({
          to: recipientEmail,
          subject: 'Membership Activated',
          template: EmailTemplates.MEMBERSHIP_CONFIRMATION,
          variables: {
            user_name: userName,
            membership_name: plan === 'yearly' ? 'Yearly Membership' : 'Monthly Membership',
            plan_type: plan === 'yearly' ? 'Yearly Membership' : 'Monthly Membership',
            billing_cycle: plan === 'yearly' ? 'Yearly' : 'Monthly',
            payment_amount: plan === 'yearly' ? 'CHF 120' : 'CHF 15',
            start_date: now.toLocaleDateString('en', { dateStyle: 'long' }),
            next_billing_date: endDate.toLocaleDateString('en', { dateStyle: 'long' }),
            member_id: userId.substring(0, 8).toUpperCase(),
            dashboard_url: `${appUrl}/dashboard`,
            programs_url: `${appUrl}/en/coach-training`,
            user_email: recipientEmail,
            payment_method: 'Bank Transfer',
            invoice_url: `${appUrl}/dashboard`,
            help_center_url: `${appUrl}/en/about`,
          },
        });
        await sendEmail({ to: recipientEmail, subject: emailContent.subject, html: emailContent.html });
      }
    } catch (emailError) {
      console.error('Failed to send membership confirmation email:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
