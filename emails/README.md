# Email Templates for Infinity Role Teachers

Organized by sender: **Supabase** (auth), **Application** (business logic via Hostpoint.ch), **Stripe** (payment webhooks).

---

## 📁 Folder Structure

```
emails/
├── supabase/           # Supabase Auth Templates (Go Template syntax)
├── application/        # Application Emails → Hostpoint.ch SMTP
├── stripe/             # Stripe Webhook Templates (if needed)
└── README.md           # This file
```

---

## 🔐 Supabase Auth Templates (`/supabase/`)

These templates use **Go Template syntax** (`{{ .Variable }}`) and go directly into Supabase Dashboard.

### Templates

| File | Supabase Template Name | Variables |
|------|------------------------|-----------|
| `confirm-signup.html` | Confirm signup | `{{ .ConfirmationURL }}`, `{{ .Token }}` |
| `reset-password.html` | Reset password | `{{ .ConfirmationURL }}` |
| `magic-link.html` | Magic link | `{{ .ConfirmationURL }}` |
| `change-email.html` | Change email address | `{{ .ConfirmationURL }}`, `{{ .NewEmail }}` |

### How to Install in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Authentication → Email Templates**
3. Choose template (e.g., "Confirm signup")
4. Copy HTML content from corresponding file
5. Paste into Supabase template editor
6. Save

**Available Supabase Variables:**
- `{{ .ConfirmationURL }}` - Verification/confirmation link
- `{{ .Token }}` - 6-digit OTP code
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email (for change email)
- `{{ .SiteURL }}` - Your site URL from project settings

---

## 📧 Application Templates (`/application/`)

These templates use **Handlebars/Custom syntax** (`{{variable}}`) and are sent via **Hostpoint.ch SMTP** from our application code.

### Templates

| File | Purpose | Variables |
|------|---------|-----------|
| `event-registration.html` | Event confirmation | `{{user_name}}`, `{{event_title}}`, `{{event_date}}`, `{{payment_amount}}`, etc. |
| `coach-training-registration.html` | Training enrollment | `{{user_name}}`, `{{program_name}}`, `{{start_date}}`, etc. |
| `membership-confirmation.html` | Membership welcome | `{{user_name}}`, `{{membership_name}}`, `{{billing_cycle}}`, etc. |
| `password-reset.html` | Custom password reset | `{{user_name}}`, `{{reset_url}}` |
| `supabase-verification.html` | Custom verification | `{{user_name}}`, `{{verification_code}}`, `{{confirmation_url}}` |

### How to Use

These are sent from your application code via Hostpoint.ch SMTP:

```javascript
// Example: Sending event registration confirmation
const template = fs.readFileSync('./emails/application/event-registration.html', 'utf8');
const emailBody = template
  .replace('{{user_name}}', user.name)
  .replace('{{event_title}}', event.title)
  .replace('{{event_date}}', event.date);

await transporter.sendMail({
  from: 'Infinity Role Teachers <support@infinityroleteachers.com>',
  to: user.email,
  subject: 'Event Registration Confirmed',
  html: emailBody
});
```

**Available Variables:**
- `{{user_name}}`, `{{user_email}}` - User details
- `{{event_title}}`, `{{event_date}}`, `{{event_time}}`, `{{event_location}}` - Event info
- `{{program_name}}`, `{{start_date}}`, `{{program_duration}}` - Training info
- `{{membership_name}}`, `{{billing_cycle}}`, `{{next_billing_date}}` - Membership info
- `{{payment_amount}}`, `{{order_id}}`, `{{registration_number}}` - Payment details

---

## 💳 Stripe Templates (`/stripe/`)

For custom webhook-based emails if needed (Stripe sends built-in receipts in live mode).

---

## 🎨 Design System

All templates use consistent earth-tone design:

### Color Palette
- **Primary**: `#8b7355` (Warm Brown)
- **Secondary**: `#5c4a3a` (Dark Brown)
- **Accent**: `#c4a77d` (Gold/Tan)
- **Background**: `#faf8f5` (Warm Off-White)
- **Card**: `#f9f6f2` (Light Cream)

### Typography
- **Headings**: Georgia serif, 18-26px
- **Body**: Georgia, 15px, line-height 1.8
- **UI Elements**: Arial, uppercase, letter-spacing 1-2px

### Logo
- **URL**: `https://nchbiryeykludxrrdfaw.supabase.co/storage/v1/object/public/images/pages/home/logo%20small%20transparent.png`
- **Header**: 85-95px width, height: auto (natural ratio)
- **Footer**: 45-50px width, height: auto

---

## 🔧 Hostpoint.ch Integration

To send application emails via Hostpoint.ch:

1. **Create email** in Hostpoint: `support@infinityroleteachers.com`
2. **Get SMTP credentials** from Hostpoint control panel
3. **Add to `.env.local`:**
   ```
   SMTP_HOST=mail.hostpoint.ch
   SMTP_PORT=587
   SMTP_USER=support@infinityroleteachers.com
   SMTP_PASS=your_password
   SMTP_FROM=Infinity Role Teachers <support@infinityroleteachers.com>
   ```
4. **Create API route** for sending emails using Nodemailer

---

## 📋 Quick Reference

| When | Who Sends | Where Template Lives | Syntax |
|------|-----------|---------------------|--------|
| User signs up | Supabase | `/supabase/confirm-signup.html` | `{{ .ConfirmationURL }}` |
| Password reset | Supabase | `/supabase/reset-password.html` | `{{ .ConfirmationURL }}` |
| Event registration | Our App | `/application/event-registration.html` | `{{user_name}}` |
| Training enrollment | Our App | `/application/coach-training-registration.html` | `{{program_name}}` |
| Membership signup | Our App | `/application/membership-confirmation.html` | `{{membership_name}}` |
| Payment receipt | Stripe | Built-in (live mode) | — |

---

## ✅ Email Client Compatibility

Tested and compatible with:
- ✅ Apple Mail (iOS/macOS)
- ✅ Gmail (Web/App)
- ✅ Outlook (Web/Desktop)
- ✅ Yahoo Mail
- ✅ Samsung Mail
- ✅ Thunderbird
- ✅ Proton Mail
