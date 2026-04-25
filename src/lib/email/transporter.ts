import nodemailer from 'nodemailer';

// Hostpoint.ch SMTP configuration
const SMTP_HOST = process.env.SMTP_HOST || 'mail.hostpoint.ch';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Infinity Role Teachers <support@infinityroleteachers.com>';

// Verify SMTP is configured
export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

// Create transporter
export function createTransporter() {
  if (!isEmailConfigured()) {
    console.warn('SMTP not configured. Emails will be logged but not sent.');
    return null;
  }

  return nodemailer.createTransporter({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs
    },
  });
}

// Send email helper
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = createTransporter();

  // If SMTP not configured, log email and return success (dev mode)
  if (!transporter) {
    console.log('📧 EMAIL (not sent - SMTP not configured):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('From:', options.from || SMTP_FROM);
    return { success: true, messageId: 'logged-only' };
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    console.log('✉️ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
