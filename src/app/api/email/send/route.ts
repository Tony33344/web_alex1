import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/transporter';
import { prepareEmail, EmailTemplates, type TemplatedEmailOptions } from '@/lib/email/templates';
import { createAdminClient } from '@/lib/supabase/admin';

// Send templated email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, template, variables, subject } = body;

    // Validate required fields
    if (!to || !template || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template, subject' },
        { status: 400 }
      );
    }

    // Validate template exists
    if (!Object.values(EmailTemplates).includes(template)) {
      return NextResponse.json(
        { error: `Invalid template: ${template}` },
        { status: 400 }
      );
    }

    // Prepare email from template
    const { html } = prepareEmail({
      to,
      template,
      subject,
      variables: variables || {},
    });

    // Send email
    const result = await sendEmail({
      to,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send event registration confirmation
export async function sendEventRegistrationEmail(
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  orderId: string,
  amount: string
) {
  const { html, subject } = prepareEmail({
    to: userEmail,
    template: EmailTemplates.EVENT_REGISTRATION,
    subject: `Registration Confirmed: ${eventTitle}`,
    variables: {
      user_name: userName,
      event_title: eventTitle,
      event_date: eventDate,
      event_time: eventTime,
      event_location: eventLocation,
      order_id: orderId,
      payment_amount: amount,
    },
  });

  return sendEmail({ to: userEmail, subject, html });
}

// Send coach training enrollment confirmation
export async function sendCoachTrainingEmail(
  userEmail: string,
  userName: string,
  programName: string,
  startDate: string,
  duration: string,
  orderId: string,
  amount: string
) {
  const { html, subject } = prepareEmail({
    to: userEmail,
    template: EmailTemplates.COACH_TRAINING_REGISTRATION,
    subject: `Enrollment Confirmed: ${programName}`,
    variables: {
      user_name: userName,
      program_name: programName,
      start_date: startDate,
      program_duration: duration,
      order_id: orderId,
      payment_amount: amount,
    },
  });

  return sendEmail({ to: userEmail, subject, html });
}

// Send membership confirmation
export async function sendMembershipConfirmationEmail(
  userEmail: string,
  userName: string,
  membershipName: string,
  billingCycle: string,
  nextBillingDate: string,
  amount: string
) {
  const { html, subject } = prepareEmail({
    to: userEmail,
    template: EmailTemplates.MEMBERSHIP_CONFIRMATION,
    subject: 'Welcome to Infinity Role Teachers Membership',
    variables: {
      user_name: userName,
      membership_name: membershipName,
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate,
      payment_amount: amount,
    },
  });

  return sendEmail({ to: userEmail, subject, html });
}

// Send welcome email after email confirmation
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  dashboardUrl: string = 'https://infinityroleteachers.com/en/welcome'
) {
  const { html, subject } = prepareEmail({
    to: userEmail,
    template: EmailTemplates.WELCOME,
    subject: 'Welcome to Infinity Role Teachers',
    variables: {
      user_name: userName,
      dashboard_url: dashboardUrl,
    },
  });

  return sendEmail({ to: userEmail, subject, html });
}
