import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { donationId } = await request.json();
    if (!donationId) {
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    // Get donation details before updating
    const { data: donation } = await admin
      .from('donations')
      .select('id, user_id, amount, currency, payment_method')
      .eq('id', donationId)
      .single();

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Update donation status to paid
    const { error: updateError } = await admin
      .from('donations')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', donationId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Send donation confirmation email
    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, email')
        .eq('id', donation.user_id)
        .single();
      const { data: { user: donorUser } } = await admin.auth.admin.getUserById(donation.user_id);
      const recipientEmail = profile?.email || donorUser?.email;
      
      if (recipientEmail) {
        const userName = profile?.full_name || recipientEmail.split('@')[0] || 'there';
        const currency = donation.currency?.toUpperCase() || 'CHF';
        const emailContent = prepareEmail({
          to: recipientEmail,
          subject: 'Donation Confirmed - Thank You!',
          template: EmailTemplates.DONATION_CONFIRMATION,
          variables: {
            user_name: userName,
            donation_amount: `${currency} ${donation.amount.toFixed(2)}`,
            donation_date: new Date().toLocaleDateString('en', { dateStyle: 'long' }),
            receipt_id: `DON-${donationId.substring(0, 8).toUpperCase()}`,
          },
        });
        await sendEmail({ to: recipientEmail, subject: emailContent.subject, html: emailContent.html });
      }
    } catch (emailError) {
      console.error('Failed to send donation confirmation email:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
