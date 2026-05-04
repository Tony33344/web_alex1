import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createDynamicCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, message, paymentMethod } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Generate bank transfer reference if needed
    const bankRef = paymentMethod === 'bank_transfer'
      ? `DON-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert donation record
    const { error: insertError } = await adminSupabase.from('donations').insert({
      user_id: user.id,
      amount,
      currency: 'CHF',
      message: message || null,
      payment_method: paymentMethod || 'stripe',
      payment_status: paymentMethod === 'bank_transfer' ? 'pending' : 'pending',
      bank_transfer_reference: bankRef,
    });

    if (insertError) {
      console.error('Donation insert error:', insertError.message);
      return NextResponse.json({ error: 'Donation failed: ' + insertError.message }, { status: 500 });
    }

    // Bank transfer — send pending email and return reference
    if (paymentMethod === 'bank_transfer') {
      // Send pending donation email
      try {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
        const emailContent = prepareEmail({
          to: user.email!,
          subject: 'Donation Pending - Bank Transfer Required',
          template: EmailTemplates.DONATION_CONFIRMATION,
          variables: {
            user_name: userName,
            donation_amount: `CHF ${amount.toFixed(2)}`,
            donation_date: new Date().toLocaleDateString('en', { dateStyle: 'long' }),
            receipt_id: bankRef || 'N/A',
          },
        });
        await sendEmail({ to: user.email!, subject: emailContent.subject, html: emailContent.html });
      } catch (emailError) {
        console.error('Failed to send donation pending email:', emailError);
      }
      return NextResponse.json({ success: true, reference: bankRef });
    }

    // Stripe payment
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId || !customerId.startsWith('cus_')) {
      const customer = await createOrRetrieveCustomer({
        email: user.email!,
        name: profile?.full_name || '',
        supabaseId: user.id,
      });
      customerId = customer.id;
      await adminSupabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const requestUrl = new URL(request.url);
    const appUrl = requestUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripeMetadata = { user_id: user.id, type: 'donation', message: message || '' };
    const successUrl = `${appUrl}/donate?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/donate?payment=cancelled`;

    const session = await createDynamicCheckoutSession({
      customerId,
      productName: 'Donation to Infinity Role Teachers',
      amountInCents: Math.round(amount * 100),
      currency: 'chf',
      successUrl,
      cancelUrl,
      metadata: stripeMetadata,
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (err) {
    console.error('Donation error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
