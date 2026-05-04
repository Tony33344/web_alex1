import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Generate bank transfer reference
    const bankRef = `MEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Update profile with pending subscription. Do NOT touch stripe_customer_id — that field is reserved
    // for real Stripe customer IDs (starting with 'cus_'); overwriting it breaks future Stripe checkouts.
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_plan: plan,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Membership bank transfer error:', error);
      return NextResponse.json({ error: 'Failed to create bank transfer request: ' + error.message }, { status: 500 });
    }

    // Send pending payment email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
      const membershipUrl = `${appUrl}/en/membership`;
      const membershipName = plan === 'yearly' ? 'Annual Membership' : 'Monthly Membership';
      const paymentAmount = plan === 'yearly' ? 'TBA' : 'TBA'; // Will need to fetch actual price from database
      
      const emailContent = prepareEmail({
        to: user.email!,
        subject: 'Membership Pending - Payment Required',
        template: EmailTemplates.MEMBERSHIP_PENDING,
        variables: {
          user_name: userName,
          membership_name: membershipName,
          billing_cycle: plan === 'yearly' ? 'Yearly' : 'Monthly',
          payment_amount: paymentAmount,
          reference: bankRef,
          membership_url: membershipUrl,
          bank_name: 'UBS Switzerland AG', // TODO: Get from settings
          bank_account: 'CH1234567890123456789', // TODO: Get from settings
          bank_iban: 'CH89 1234 5678 9012 3456 7890', // TODO: Get from settings
          bank_bic: 'UBSWCHZH80A', // TODO: Get from settings
        },
      });

      await sendEmail({
        to: user.email!,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('Failed to send membership pending email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, reference: bankRef });
  } catch (err) {
    console.error('Membership bank transfer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
