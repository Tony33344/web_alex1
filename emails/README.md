# Email Templates for Infinity Role Teachers

Beautiful, responsive HTML email templates for all user communications.

## Templates

### 1. supabase-verification.html
**Purpose**: Email verification for new user registrations  
**Variables**:
- `{{user_name}}` - User's first name
- `{{verification_code}}` - 6-digit verification code
- `{{confirmation_url}}` - Link to confirm email
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{privacy_url}}` - Privacy policy URL

**Usage**: Supabase Auth email confirmation

---

### 2. password-reset.html
**Purpose**: Password reset requests  
**Variables**:
- `{{user_name}}` - User's first name
- `{{reset_url}}` - Password reset link (valid 1 hour)

**Usage**: Supabase Auth password recovery

---

### 3. event-registration.html
**Purpose**: Event registration confirmations  
**Variables**:
- `{{user_name}}` - User's first name
- `{{event_title}}` - Event name
- `{{event_date}}` - Event date
- `{{event_time}}` - Event time
- `{{event_location}}` - Event location
- `{{payment_amount}}` - Amount paid
- `{{order_id}}` - Order reference number
- `{{registration_number}}` - Unique registration number
- `{{event_url}}` - Link to event details
- `{{calendar_url}}` - Add to calendar link
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{privacy_url}}` - Privacy policy URL

**Usage**: After successful event registration payment

---

### 4. coach-training-registration.html
**Purpose**: Coach training program enrollment confirmations  
**Variables**:
- `{{user_name}}` - User's first name
- `{{program_name}}` - Training program name
- `{{program_duration}}` - Program duration (e.g., "2 days")
- `{{start_date}}` - Program start date
- `{{program_time}}` - Daily schedule time
- `{{location}}` - Training location
- `{{max_participants}}` - Maximum group size
- `{{payment_amount}}` - Amount paid
- `{{enrollment_id}}` - Unique enrollment ID
- `{{program_url}}` - Link to program dashboard
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{privacy_url}}` - Privacy policy URL

**Usage**: After successful coach training enrollment

---

### 5. membership-confirmation.html
**Purpose**: Membership subscription confirmations  
**Variables**:
- `{{user_name}}` - User's full name
- `{{membership_name}}` - Membership tier name
- `{{plan_type}}` - Monthly/Yearly
- `{{billing_cycle}}` - Billing frequency
- `{{payment_amount}}` - Amount charged
- `{{start_date}}` - Membership start date
- `{{next_billing_date}}` - Next billing date
- `{{member_id}}` - Unique member ID
- `{{user_email}}` - User's email address
- `{{payment_method}}` - Card type ending in XXXX
- `{{invoice_url}}` - Link to view/download invoice
- `{{dashboard_url}}` - Member dashboard URL
- `{{programs_url}}` - Programs listing URL
- `{{help_center_url}}` - Help center URL
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{privacy_url}}` - Privacy policy URL
- `{{terms_url}}` - Terms of service URL

**Usage**: After successful membership subscription

---

## Design System

### Colors
- **Primary Gradient**: `#667eea` to `#764ba2` (Purple/Blue)
- **Secondary Gradient**: `#f093fb` to `#f5576c` (Pink/Red) - For coach training
- **Membership Gradient**: `#4facfe` to `#00f2fe` (Blue/Teal)
- **Success**: `#22c55e` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Danger**: `#ff6b6b` (Red) - For password reset

### Typography
- **Font Family**: System font stack (Apple, Google, Windows compatible)
- **Headings**: 20-28px, font-weight 600-700
- **Body**: 14-16px, line-height 1.6-1.8
- **Labels**: 12-14px, uppercase, letter-spacing 1px

### Logo
- **URL**: `https://nchbiryeykludxrrdfaw.supabase.co/storage/v1/object/public/images/pages/home/logo%20small%20transparent.png`
- **Size**: 80x80px in header, 50x50px in footer
- **Style**: Rounded, with subtle shadow

---

## Email Client Compatibility

These templates are tested and compatible with:
- ✅ Apple Mail (iOS/macOS)
- ✅ Gmail (Web/App)
- ✅ Outlook (Web/Desktop)
- ✅ Yahoo Mail
- ✅ Samsung Mail
- ✅ Thunderbird

**Notes**:
- Uses table-based layout for maximum compatibility
- Inline CSS for Gmail compatibility
- Responsive design with media queries
- Web-safe fonts only

---

## Supabase Integration

To use these templates with Supabase Auth:

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. Replace the default templates with these HTML templates
3. Update the variable syntax from `{{variable}}` to Supabase's format

### Supabase Variable Mapping

Supabase uses different variable syntax:

| Our Template | Supabase Format |
|-------------|-----------------|
| `{{user_name}}` | `{{ .Data.user_name }}` or `{{ .User.Email }}` |
| `{{confirmation_url}}` | `{{ .ConfirmationURL }}` |
| `{{reset_url}}` | `{{ .ConfirmationURL }}` |

**Example Supabase template**:
```html
<h1>Hello {{ .User.Email }}</h1>
<a href="{{ .ConfirmationURL }}">Verify Email</a>
```

---

## Hostpoint.ch Integration

To send emails via Hostpoint.ch:

1. **Set up SMTP in your application**:
   ```env
   SMTP_HOST=mail.hostpoint.ch
   SMTP_PORT=587
   SMTP_USER=support@infinityroleteachers.com
   SMTP_PASS=your_password
   SMTP_FROM=Infinity Role Teachers <support@infinityroleteachers.com>
   ```

2. **Create email sending function** using Nodemailer or similar

3. **Use these HTML templates** as the email body

4. **Replace variables** dynamically before sending

---

## Usage Examples

### Node.js with Nodemailer

```javascript
import nodemailer from 'nodemailer';
import fs from 'fs';

// Read template
const template = fs.readFileSync('./emails/event-registration.html', 'utf8');

// Replace variables
const emailBody = template
  .replace('{{user_name}}', user.name)
  .replace('{{event_title}}', event.title)
  .replace('{{event_date}}', event.date);

// Send email
const transporter = nodemailer.createTransport({
  host: 'mail.hostpoint.ch',
  port: 587,
  auth: {
    user: 'support@infinityroleteachers.com',
    pass: process.env.SMTP_PASSWORD
  }
});

await transporter.sendMail({
  from: 'Infinity Role Teachers <support@infinityroleteachers.com>',
  to: user.email,
  subject: '🎉 You\'re Registered! ' + event.title,
  html: emailBody
});
```

---

## Customization

To update branding:
1. Replace the logo URL with your own
2. Update gradient colors in the `<style>` section
3. Change company name in footer
4. Update social media links

---

## File Structure

```
emails/
├── README.md                           # This file
├── supabase-verification.html          # Email verification
├── password-reset.html                 # Password recovery
├── event-registration.html             # Event confirmations
├── coach-training-registration.html    # Training confirmations
└── membership-confirmation.html        # Membership welcome
```

---

## Preview

Open any `.html` file in a web browser to preview. All templates are self-contained with inline styles.
