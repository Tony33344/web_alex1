import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { sendEmail } from '@/lib/email/transporter';
import { prepareEmail, EmailTemplates } from '@/lib/email/templates';

/**
 * Verifies a Stripe Checkout Session and activates the matching record.
 * Idempotent — safe to call multiple times.
 * Returns true if session was valid and processed.
 */
export async function verifyAndActivateSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    console.log('verifyAndActivateSession: START', { sessionId, userId });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    console.log('verifyAndActivateSession: session retrieved', {
      payment_status: session.payment_status,
      status: session.status,
      mode: session.mode,
      type: session.metadata?.type,
      user_id: session.metadata?.user_id,
    });

    // For webhooks, use the user_id from session metadata if provided
    // (webhooks are server-to-server and don't have authenticated user context)
    const effectiveUserId = session.metadata?.user_id || userId;

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      console.log('verifyAndActivateSession: payment not complete', { payment_status: session.payment_status, status: session.status });
      return false;
    }

    const admin = createAdminClient();
    const type = session.metadata?.type;

    // Get user profile for email
    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', effectiveUserId)
      .single();

    if (type === 'membership' && session.mode === 'subscription') {
      const sub = typeof session.subscription === 'object' ? session.subscription : null;
      const endTs = sub && 'current_period_end' in sub && typeof sub.current_period_end === 'number'
        ? sub.current_period_end
        : null;

      const { error } = await admin
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: session.metadata?.plan || null,
          subscription_end_date: endTs ? new Date(endTs * 1000).toISOString() : null,
        })
        .eq('id', effectiveUserId);

      if (error) {
        console.error('verify-session: profile update error', error);
        return false;
      }
      console.log('verify-session: membership activated successfully', { userId: effectiveUserId, plan: session.metadata?.plan });

      // Send membership confirmation email
      console.log('🔍 Preparing membership confirmation email for user:', effectiveUserId);
      if (profile?.email) {
        try {
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
          const { html } = prepareEmail({
            to: profile.email,
            template: EmailTemplates.MEMBERSHIP_CONFIRMATION,
            subject: 'Welcome to Infinity Role Teachers Membership',
            variables: {
              user_name: profile.full_name || 'Valued Member',
              membership_name: session.metadata?.plan === 'yearly' ? 'Annual Membership' : 'Monthly Membership',
              billing_cycle: session.metadata?.plan === 'yearly' ? 'Yearly' : 'Monthly',
              next_billing_date: endTs ? new Date(endTs * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
              payment_amount: `CHF ${amount}`,
            },
          });
          await sendEmail({ to: profile.email, subject: 'Welcome to Infinity Role Teachers Membership', html });
          console.log('✅ Membership confirmation email sent to', profile.email);
        } catch (emailError) {
          console.error('Failed to send membership email:', emailError);
        }
      }

      return true;
    }

    if (type === 'event') {
      const eventId = session.metadata?.event_id;
      console.log('verifyAndActivateSession: Processing event payment', { eventId, effectiveUserId });
      if (eventId) {
        const { error: updateError } = await admin
          .from('event_registrations')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('user_id', effectiveUserId);
        
        if (updateError) {
          console.error('verifyAndActivateSession: Failed to update event registration:', updateError);
        } else {
          console.log('verifyAndActivateSession: Event registration updated successfully');
        }

        // Get event details for email
        const { data: event } = await admin
          .from('events')
          .select('title_en, title_de, start_date, location, is_online')
          .eq('id', eventId)
          .single();

        console.log('verifyAndActivateSession: Event data fetched', { event, profile: !!profile });

        // Send event confirmation email
        if (profile?.email && event) {
          try {
            const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
            const { html } = prepareEmail({
              to: profile.email,
              template: EmailTemplates.EVENT_REGISTRATION,
              subject: 'Event Registration Confirmed - Infinity Role Teachers',
              variables: {
                user_name: profile.full_name || 'Valued Member',
                event_title: event.title_en || event.title_de || 'Event',
                event_date: new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                event_time: new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                event_location: event.is_online ? 'Online' : event.location || 'TBA',
                order_id: session.id,
                payment_amount: `CHF ${amount}`,
              },
            });
            await sendEmail({ to: profile.email, subject: 'Event Registration Confirmed - Infinity Role Teachers', html });
            console.log('✅ Event confirmation email sent to', profile.email);
          } catch (emailError) {
            console.error('Failed to send event email:', emailError);
          }
        } else {
          console.warn('verifyAndActivateSession: Cannot send event email - missing profile.email or event data', { hasEmail: !!profile?.email, hasEvent: !!event });
        }
      } else {
        console.warn('verifyAndActivateSession: Event payment but no eventId in metadata');
      }
      return true;
    }

    if (type === 'program') {
      const programId = session.metadata?.program_id;
      console.log('verifyAndActivateSession: Processing program payment', { programId, effectiveUserId });
      if (programId) {
        const { error: updateError } = await admin
          .from('program_enrollments')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('program_id', programId)
          .eq('user_id', effectiveUserId);
        
        if (updateError) {
          console.error('verifyAndActivateSession: Failed to update program enrollment:', updateError);
        } else {
          console.log('verifyAndActivateSession: Program enrollment updated successfully');
        }

        // Get program details for email
        const { data: program } = await admin
          .from('programs')
          .select('name_en, name_de, duration, start_date, location, max_participants')
          .eq('id', programId)
          .single();

        console.log('verifyAndActivateSession: Program data fetched', { program, profile: !!profile });

        // Send program confirmation email
        if (profile?.email && program) {
          try {
            const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
            const { html } = prepareEmail({
              to: profile.email,
              template: EmailTemplates.COACH_TRAINING_REGISTRATION,
              subject: 'Coach Training Enrollment Confirmed - Infinity Role Teachers',
              variables: {
                user_name: profile.full_name || 'Valued Member',
                program_name: program.name_en || program.name_de || 'Program',
                start_date: program.start_date ? new Date(program.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA',
                program_time: program.start_date ? new Date(program.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
                program_duration: program.duration || 'TBA',
                location: program.location || 'TBA',
                max_participants: program.max_participants?.toString() || 'TBA',
                order_id: session.id,
                payment_amount: `CHF ${amount}`,
                program_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/coach-training/${programId}`,
              },
            });
            await sendEmail({ to: profile.email, subject: 'Coach Training Enrollment Confirmed - Infinity Role Teachers', html });
            console.log('✅ Program confirmation email sent to', profile.email);
          } catch (emailError) {
            console.error('Failed to send program email:', emailError);
          }
        } else {
          console.warn('verifyAndActivateSession: Cannot send program email - missing profile.email or program data', { hasEmail: !!profile?.email, hasProgram: !!program });
        }
      } else {
        console.warn('verifyAndActivateSession: Program payment but no programId in metadata');
      }
      return true;
    }

    return true;
  } catch (err) {
    console.error('verify-session error:', err);
    return false;
  }
}
