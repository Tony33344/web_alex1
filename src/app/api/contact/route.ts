import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validators';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/transporter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('contact_submissions').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: 'new',
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Send notification email to admin
    const adminEmail = process.env.SMTP_FROM?.match(/<(.+)>/)?.[1] || 'info@infinityroleteachers.com';
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5530; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #2c5530; }
          .value { margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field"><span class="label">Name:</span><span class="value">${parsed.data.name}</span></div>
            <div class="field"><span class="label">Email:</span><span class="value">${parsed.data.email}</span></div>
            <div class="field"><span class="label">Phone:</span><span class="value">${parsed.data.phone || 'Not provided'}</span></div>
            <div class="field"><span class="label">Subject:</span><span class="value">${parsed.data.subject}</span></div>
            <div class="field"><span class="label">Message:</span><span class="value">${parsed.data.message}</span></div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form: ${parsed.data.subject}`,
        html: adminHtml,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    const userHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5530; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank you for contacting us!</h2>
          </div>
          <div class="content">
            <p>Dear ${parsed.data.name},</p>
            <p>We have received your message regarding "${parsed.data.subject}".</p>
            <p>We will get back to you as soon as possible.</p>
            <p>Best regards,<br>Infinity Role Teachers Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        to: parsed.data.email,
        subject: 'Thank you for contacting Infinity Role Teachers',
        html: userHtml,
      });
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
