import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/transporter';
import { prepareEmail, EmailTemplates } from '@/lib/email/templates';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();
  console.log(`🔔 Stripe webhook received: ${event.type}`);

  // Helper to get user profile with email and name
  // Falls back to auth.users email if profiles.email is missing
  async function getUserProfile(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();
    
    // If profile email is missing, try to get it from auth
    if (!profile?.email) {
      try {
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.email) {
          return { email: authUser.email, full_name: profile?.full_name || null };
        }
      } catch {
        // admin API might not be available in webhook context
      }
    }
    
    return profile;
  }

  // Helper to safely send confirmation email
  async function sendConfirmationEmail(
    template: string,
    userId: string,
    subject: string,
    variables: Record<string, string>
  ) {
    try {
      console.log(`🔍 Attempting to send email to user ${userId} with template ${template}`);
      const profile = await getUserProfile(userId);
      if (!profile?.email) {
        console.warn('⚠️ No email found for user:', userId);
        return;
      }

      console.log(`📧 User email found: ${profile.email}, name: ${profile.full_name || 'N/A'}`);

      const { html } = prepareEmail({
        to: profile.email,
        template: template as any,
        subject,
        variables: {
          ...variables,
          user_name: profile.full_name || 'Valued Member',
        },
      });

      console.log(`📝 Email template prepared, sending...`);
      const result = await sendEmail({
        to: profile.email,
        subject,
        html,
      });

      if (result.success) {
        console.log(`✅ Confirmation email sent to ${profile.email}, messageId: ${result.messageId}`);
      } else {
        console.error(`❌ Email send failed to ${profile.email}:`, result.error);
      }
    } catch (err) {
      console.error('❌ Failed to send confirmation email:', err);
      // Don't throw - webhook should not fail due to email
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const type = session.metadata?.type;
      const eventId = session.metadata?.event_id;
      const programId = session.metadata?.program_id;
      const message = session.metadata?.message;

      // Subscription payment (membership)
      if ((type === 'membership' || !type) && userId && session.subscription) {
        const subResponse = await stripe.subscriptions.retrieve(session.subscription as string);
        const sub = subResponse as unknown as { current_period_end: number };
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: plan || 'monthly',
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Send membership confirmation email
        const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
        await sendConfirmationEmail(
          EmailTemplates.MEMBERSHIP_CONFIRMATION,
          userId,
          'Welcome to Infinity Role Teachers Membership',
          {
            membership_name: plan === 'yearly' ? 'Annual Membership' : 'Monthly Membership',
            billing_cycle: plan === 'yearly' ? 'Yearly' : 'Monthly',
            next_billing_date: new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }),
            payment_amount: `CHF ${amount}`,
          }
        );
      }

      // One-time event payment
      if (type === 'event' && userId && eventId) {
        console.log(`🎫 Processing event payment: eventId=${eventId}, userId=${userId}`);
        
        // Check if already confirmed (idempotency)
        const { data: existingReg } = await supabase
          .from('event_registrations')
          .select('id, status, payment_status')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingReg?.payment_status === 'paid') {
          console.log(`🎫 Event registration already paid, skipping update: eventId=${eventId}, userId=${userId}`);
        } else {
          const { error: updateError } = await supabase
            .from('event_registrations')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              stripe_payment_intent_id: session.payment_intent as string || null,
              confirmed_at: new Date().toISOString(),
            })
            .eq('event_id', eventId)
            .eq('user_id', userId);
          
          if (updateError) {
            console.error(`🎫 Failed to update event registration:`, updateError);
          }
        }

        // Always attempt to send confirmation email (even if already paid, email might have failed before)
        const { data: eventData } = await supabase
          .from('events')
          .select('title, start_date, location')
          .eq('id', eventId)
          .single();
        
        if (eventData) {
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const orderId = session.id.slice(-8).toUpperCase();
          await sendConfirmationEmail(
            EmailTemplates.EVENT_REGISTRATION,
            userId,
            `Registration Confirmed: ${eventData.title}`,
            {
              event_title: eventData.title,
              event_date: new Date(eventData.start_date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              }),
              event_time: new Date(eventData.start_date).toLocaleTimeString('en-US', { 
                hour: '2-digit', minute: '2-digit' 
              }),
              event_location: eventData.location || 'TBD',
              order_id: orderId,
              payment_amount: `CHF ${amount}`,
            }
          );
        } else {
          console.error(`🎫 Event not found for ID: ${eventId}`);
        }
      }

      // One-time program payment
      if (type === 'program' && userId && programId) {
        await supabase
          .from('program_enrollments')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string || null,
            confirmed_at: new Date().toISOString(),
          })
          .eq('program_id', programId)
          .eq('user_id', userId);

        // Get program details and send confirmation email
        const { data: programData } = await supabase
          .from('programs')
          .select('title_en, start_date, duration_days')
          .eq('id', programId)
          .single();
        
        if (programData) {
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const orderId = session.id.slice(-8).toUpperCase();
          await sendConfirmationEmail(
            EmailTemplates.COACH_TRAINING_REGISTRATION,
            userId,
            `Enrollment Confirmed: ${programData.title_en}`,
            {
              program_name: programData.title_en,
              start_date: programData.start_date ? new Date(programData.start_date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              }) : 'TBD',
              program_duration: programData.duration_days ? `${programData.duration_days} days` : 'See details',
              order_id: orderId,
              payment_amount: `CHF ${amount}`,
            }
          );
        }
      }

      // One-time donation payment
      if (type === 'donation' && userId) {
        // Get donation details before updating
        const { data: donationData } = await supabase
          .from('donations')
          .select('id, amount, currency, message')
          .eq('user_id', userId)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        await supabase
          .from('donations')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string || null,
            paid_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        // Send donation confirmation email
        if (donationData) {
          const amount = (donationData.amount / 100).toFixed(2);
          const currency = donationData.currency?.toUpperCase() || 'CHF';
          const receiptId = `DON-${donationData.id.slice(-8).toUpperCase()}`;
          const donationDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          await sendConfirmationEmail(
            EmailTemplates.DONATION_CONFIRMATION,
            userId,
            'Thank You for Your Donation - Infinity Role Teachers',
            {
              donation_amount: `${currency} ${amount}`,
              donation_date: donationDate,
              receipt_id: receiptId,
            }
          );
        }
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        const status = subscription.status === 'active' ? 'active' :
          subscription.status === 'past_due' ? 'past_due' :
          subscription.status === 'canceled' ? 'cancelled' : 'inactive';

        const sub = subscription as unknown as { current_period_end: number };
        await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_plan: null,
            subscription_end_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
