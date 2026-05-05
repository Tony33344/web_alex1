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
      const paymentAmount = plan === 'yearly' ? 'CHF 120' : 'CHF 15';

      // Fetch bank info from settings
      const { data: bankSettings } = await adminSupabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['bank_name', 'bank_iban', 'bank_bic', 'bank_account_holder']);

      const bankInfo: Record<string, string> = {};
      (bankSettings ?? []).forEach((row: { key: string; value: unknown }) => {
        const val = String(row.value).replace(/"/g, '').trim();
        if (val) bankInfo[row.key] = val;
      });

      const bankName = bankInfo.bank_name || 'UBS Switzerland AG';
      const bankIban = bankInfo.bank_iban || 'CH93 0076 2011 6238 5295 7';
      const bankBic = bankInfo.bank_bic || 'AEAGCH22';
      const bankAccountHolder = bankInfo.bank_account_holder || 'AMS4EVER AG';

      // Generate QR code for bank transfer
      const qrCodeImage = `<div style="text-align: center; margin-top: 20px; padding: 15px; background: white; border: 1px dashed #DDD6FE; border-radius: 4px;">
        <p style="font-size: 12px; color: #666666; margin: 0 0 10px 0;">Scan with your banking app to pay</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BCD\n001\n1\nCHF\n${plan === 'yearly' ? '120' : '15'}\nS\n${bankIban.replace(/\s/g, '')}\n${bankAccountHolder.replace(/\s/g, '')}\n\n${bankRef}\n" alt="Bank Transfer QR Code" style="width: 150px; height: 150px; display: inline-block;">
      </div>`;
      
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
          bank_name: bankName,
          bank_iban: bankIban,
          bank_bic: bankBic,
          bank_account_holder: bankAccountHolder,
          qr_code_image: qrCodeImage,
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
