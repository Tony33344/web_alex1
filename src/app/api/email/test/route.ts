import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/transporter';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SMTP Test</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">SMTP Test Email</h1>
          <p>This is a test email to verify your Hostpoint SMTP configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your SMTP settings are correct!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Infinity Role Teachers<br>
            <a href="https://infinityroleteachers.com" style="color: #2c5530;">infinityroleteachers.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'SMTP Test - Infinity Role Teachers',
      html: testHtml,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
