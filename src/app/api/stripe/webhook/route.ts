import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/transporter';
import { prepareEmail, EmailTemplates } from '@/lib/email/templates';
import { getLocalizedField } from '@/lib/localization';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

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
    variables: Record<string, string>,
    locale: string = 'en'
  ) {
    try {
      console.log(`🔍 Attempting to send email to user ${userId} with template ${template} (locale: ${locale})`);
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
        locale,
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
        const profile = await getUserProfile(userId);
        const userLocale = (profile as any)?.preferred_language || 'en';
        const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
        await sendConfirmationEmail(
          EmailTemplates.MEMBERSHIP_CONFIRMATION,
          userId,
          'Welcome to Infinity Role Teachers Membership',
          {
            membership_name: plan === 'yearly' ? 'Annual Membership' : 'Monthly Membership',
            billing_cycle: plan === 'yearly' ? 'Yearly' : 'Monthly',
            next_billing_date: new Date(sub.current_period_end * 1000).toLocaleDateString(userLocale, {
              year: 'numeric', month: 'long', day: 'numeric'
            }),
            payment_amount: `CHF ${amount}`,
          },
          userLocale
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
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const { error: updateError } = await supabase
            .from('event_registrations')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              stripe_payment_intent_id: session.payment_intent as string || null,
              confirmed_at: new Date().toISOString(),
              price_paid: parseFloat(amount),
            })
            .eq('event_id', eventId)
            .eq('user_id', userId);
          
          if (updateError) {
            console.error(`🎫 Failed to update event registration:`, updateError);
          } else {
            // Increment attendee count only after successful payment confirmation
            const { data: eventData } = await supabase
              .from('events')
              .select('current_attendees')
              .eq('id', eventId)
              .single();
            
            if (eventData) {
              await supabase
                .from('events')
                .update({ current_attendees: eventData.current_attendees + 1 })
                .eq('id', eventId);
              console.log(`🎫 Incremented attendee count for event ${eventId}`);
            }
          }
        }

        // Always attempt to send confirmation email (even if already paid, email might have failed before)
        const { data: eventData } = await supabase
          .from('events')
          .select('title_en, start_date, location, currency')
          .eq('id', eventId)
          .single();
        
        if (eventData) {
          const profile = await getUserProfile(userId);
          const userLocale = (profile as any)?.preferred_language || 'en';
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const orderId = session.id.slice(-8).toUpperCase();
          const currency = eventData.currency || 'CHF';
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const eventUrl = `${appUrl}/${userLocale}/events/${eventId}`;
          const eventTitle = getLocalizedField(eventData, 'title', userLocale) || eventData.title_en;
          await sendConfirmationEmail(
            EmailTemplates.EVENT_REGISTRATION,
            userId,
            `Registration Confirmed: ${eventTitle}`,
            {
              event_title: eventTitle,
              event_date: new Date(eventData.start_date).toLocaleDateString(userLocale, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              }),
              event_time: new Date(eventData.start_date).toLocaleTimeString(userLocale, {
                hour: '2-digit', minute: '2-digit'
              }),
              event_location: eventData.location || 'TBD',
              order_id: orderId,
              payment_amount: `${currency} ${amount}`,
              event_url: eventUrl,
              calendar_url: eventUrl,
            },
            userLocale
          );
        } else {
          console.error(`🎫 Event not found for ID: ${eventId}`);
        }
      }

      // One-time program payment
      if (type === 'program' && userId && programId) {
        const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
        await supabase
          .from('program_enrollments')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            price_paid: parseFloat(amount),
            stripe_payment_intent_id: session.payment_intent as string || null,
            confirmed_at: new Date().toISOString(),
          })
          .eq('program_id', programId)
          .eq('user_id', userId);

        // Get program details and send confirmation email
        const { data: programData } = await supabase
          .from('programs')
          .select('name_en, slug, start_date, duration, location, max_participants, currency')
          .eq('id', programId)
          .single();
        
        if (programData) {
          const profile = await getUserProfile(userId);
          const userLocale = (profile as any)?.preferred_language || 'en';
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const orderId = session.id.slice(-8).toUpperCase();
          const currency = programData.currency || 'CHF';
          const programName = getLocalizedField(programData, 'name', userLocale) || programData.name_en;
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await sendConfirmationEmail(
            EmailTemplates.COACH_TRAINING_REGISTRATION,
            userId,
            `Enrollment Confirmed: ${programName}`,
            {
              program_name: programName,
              start_date: programData.start_date ? new Date(programData.start_date).toLocaleDateString(userLocale, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              }) : 'TBD',
              program_time: programData.start_date ? new Date(programData.start_date).toLocaleTimeString(userLocale, {
                hour: '2-digit', minute: '2-digit', hour12: false
              }) : 'TBD',
              program_duration: programData.duration || 'See details',
              location: programData.location || 'TBD',
              max_participants: programData.max_participants?.toString() || 'TBD',
              order_id: orderId,
              payment_amount: `${currency} ${amount}`,
              program_url: `${appUrl}/${userLocale}/coach-training/${programData.slug && !isUuid(programData.slug) ? programData.slug : generateSlug(programName)}`,
            },
            userLocale
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
          const profile = await getUserProfile(userId);
          const userLocale = (profile as any)?.preferred_language || 'en';
          const amount = (donationData.amount / 100).toFixed(2);
          const currency = donationData.currency?.toUpperCase() || 'CHF';
          const receiptId = `DON-${donationData.id.slice(-8).toUpperCase()}`;
          const donationDate = new Date().toLocaleDateString(userLocale, {
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
            },
            userLocale
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
