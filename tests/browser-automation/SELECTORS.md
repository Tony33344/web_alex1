# Selectors & Flows Reference

Verified selectors for Playwright automation. Do NOT re-discover — use this.

## Base URL
- **Local testing**: `http://localhost:3000` (with `USE_MAILHOG=true` in `.env.local`)
- **Production**: `https://infinityroleteachers.com` (no Mailhog)

## Prerequisites for Testing

1. **Mailhog must be running**: `mailhog` on ports 1025 (SMTP) + 8025 (Web UI)
2. **Supabase email confirmation DISABLED** in dashboard (for registration tests)
3. **Test admin credentials** in `.env.local`:
   ```
   TEST_ADMIN_EMAIL=info@infinityroleteachers.com
   TEST_ADMIN_PASSWORD=TeachThePeople2026&
   ```
4. **Stripe webhook forwarding** (for Stripe tests): 
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Critical: Radix Dialog Overlay Issue
All `CheckoutDialog` and `WaitlistDialog` components use Radix UI Dialog which renders a **portal overlay** (`data-slot="dialog-overlay"`) that intercepts pointer events.  
**Playwright clicks (even with `force=True`) do NOT trigger React onClick handlers through the overlay.**

**Solution**: Use `page.evaluate()` with JavaScript to find and click buttons directly:
```python
page.evaluate("""() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
        if (btn.textContent.includes('Bank Transfer') && btn.textContent.includes('SEPA')) {
            btn.click();
            return true;
        }
    }
    return false;
}""")
```

## Registration Page (`/en/register`)
| Element | Selector |
|---------|----------|
| Full name input | `#full_name` |
| Email input | `#email` |
| Phone input | `#phone` |
| Password input | `#password` |
| Confirm password | `#confirm_password` |
| Accept terms checkbox | `#accept_terms` |
| Submit button | `get_by_role("button", name="Sign Up")` |
| Success indicator | `get_by_text("Check Your Email")` |

**Note**: Supabase sends registration emails directly — NOT through our Mailhog transporter.

## Login Page (`/en/login`)
| Element | Selector |
|---------|----------|
| Email input | `#email` |
| Password input | `#password` |
| Submit button | `get_by_role("button", name="Sign In")` |
| Redirect after login | `/${locale}/welcome` (or `?redirect=` param) |

## Events Page (`/events`)
| Element | Selector |
|---------|----------|
| Event links | `a[href*='/events/']` |
| Event count (tested) | 3 events found |

## Event Detail Page (`/events/[slug]`)
| Element | Selector |
|---------|----------|
| Enroll button | `get_by_role("button", name="Enroll Now", exact=True)` |
| Spots left text | `get_by_text("spots left")` |
| Full event indicator | `get_by_text("Event Full")` |

## CheckoutDialog (opens after Enroll Now click)
**CRITICAL**: Use `force=True` for all clicks inside this dialog.

| Element | Selector |
|---------|----------|
| Dialog container | `[role='dialog']` (inside portal) |
| Card Payment option | `locator("text=Card Payment").first` → click with `force=True` |
| Bank Transfer option | `locator("text=Bank Transfer").first` → click with `force=True` |
| Pay button (Stripe) | `locator("button:has-text('Pay')").first` → click with `force=True` |
| Get Transfer Details button | `locator("button:has-text('Get Transfer Details')").first` → click with `force=True` |
| Done button (after bank ref) | `locator("button:has-text('Done')").first` → click with `force=True` |
| Close button | `locator("button:has-text('Close')").first` → click with `force=True` |

**Flow**: Enroll Now → Dialog opens → Select payment method → Click action button

### Bank Transfer Flow
1. Click "Enroll Now"
2. Wait 1500ms for dialog
3. Click "Bank Transfer" with `force=True`
4. Wait 500ms
5. Click "Get Transfer Details" with `force=True`
6. API returns `{ reference: "EVT-..." }`
7. Email sent with subject "Registration Pending - Payment Required"

### Stripe Flow
1. Click "Enroll Now"
2. Wait 1500ms for dialog
3. Click "Card Payment" with `force=True`
4. Wait 500ms
5. Click "Pay CHF XXX.XX" with `force=True`
6. Redirects to Stripe checkout page
7. Stripe uses iframes for card input

## Membership Page (`/membership`)
| Element | Selector |
|---------|----------|
| Subscribe Now button | `get_by_role("button", name="Subscribe Now", exact=True)` |
| Monthly toggle | Button with text from `t('membership.monthly')` |
| Yearly toggle | Button with text from `t('membership.yearly')` |
| Bank Transfer section | `get_by_text("Bank Transfer")` at bottom → redirects to contact page |
| Contact Us button (bank) | `get_by_role("button", name="Contact Us")` |

**Membership CheckoutDialog**: Same as event — uses same `CheckoutDialog` component with `force=True` required.

### Membership Bank Transfer Flow
1. Click "Subscribe Now"
2. Wait 1500ms for dialog
3. Click "Bank Transfer" with `force=True`
4. Click "Get Transfer Details" with `force=True`
5. API `/api/membership/bank-transfer` returns `{ reference: "MBR-..." }`
6. Email sent with subject containing "Membership"

### Membership Stripe Flow
1. Click "Subscribe Now"
2. Wait 1500ms for dialog
3. Click "Card Payment" with `force=True`
4. Click "Pay CHF XXX.XX" with `force=True`
5. Redirects to Stripe checkout

## Waitlist (only when event is full)
| Element | Selector |
|---------|----------|
| Join Waiting List button | `get_by_role("button", name="Join Waiting List", exact=True)` |
| Waitlist dialog name | `#wl-name` |
| Waitlist dialog email | `#wl-email` |
| Waitlist dialog phone | `#wl-phone` |
| Submit waitlist | `get_by_role("button", name="Join Waiting List")` in dialog |
| Success indicator | `get_by_text("You're on the list!")` |

**Note**: Waitlist only appears when `spotsLeft === 0`. Requires filling event to capacity first.

## Stripe Checkout Iframe Selectors
Stripe Checkout uses iframes for card fields. Use **title attribute** to find them:

```python
# Card number iframe (title contains "card number")
card_iframe = page.locator("iframe[title*='card number' i]").first
if card_iframe.is_visible():
    card_frame = card_iframe.content_frame()
    card_frame.locator("input[name='cardnumber']").fill("4242424242424242")

# Expiry iframe (title contains "expiration")
expiry_iframe = page.locator("iframe[title*='expiration' i]").first
if expiry_iframe.is_visible():
    expiry_frame = expiry_iframe.content_frame()
    expiry_frame.locator("input[name='exp-date']").fill("12/34")

# CVC iframe (title contains "CVC")
cvc_iframe = page.locator("iframe[title*='CVC' i]").first
if cvc_iframe.is_visible():
    cvc_frame = cvc_iframe.content_frame()
    cvc_frame.locator("input[name='cvc']").fill("123")

# Cardholder name (NOT in iframe)
page.locator("input[name='billingName']").fill("Test User")

# Submit button
page.locator("button[type='submit']").click()
```

**Test Card**: `4242 4242 4242 4242`, Expiry: `12/34`, CVC: `123`

## Admin API Endpoints (for confirming payments)

| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| Confirm event payment | `/api/admin/registrations` | PATCH | `{"table": "event_registrations", "id": "...", "data": {"payment_status": "paid", "status": "confirmed"}}` |
| Confirm program payment | `/api/admin/registrations` | PATCH | `{"table": "program_enrollments", "id": "...", "data": {"payment_status": "paid", "status": "confirmed"}}` |
| Activate membership | `/api/admin/members/activate` | POST | `{"userId": "...", "plan": "monthly"}` |
| Confirm donation | `/api/admin/donations/confirm` | PATCH | `{"donationId": "..."}` |

## Email Subjects (for Mailhog verification)

| Flow | Pending Email | Confirmed Email | Status |
|------|--------------|-----------------|--------|
| Free Event | N/A | "Free Event Registration Confirmed" | ✅ Working |
| Event Bank Transfer | "Registration Pending - Payment Required" | "Event Registration Confirmed" | ✅ Fixed - admin confirm sends email |
| Event Stripe | N/A | "Registration Confirmed: ..." | ⚠️ Requires Stripe webhook |
| Membership Bank Transfer | "Membership Pending - Payment Required" | "Membership Activated" | ✅ Fixed - admin activate sends email |
| Membership Stripe | N/A | "Welcome to ... Membership" | ⚠️ Requires Stripe webhook |
| Program Bank Transfer | "Enrollment Pending - Payment Required" | "Program Enrollment Confirmed" | ✅ Fixed - admin confirm sends email |
| Donation Bank Transfer | "Donation Pending - Bank Transfer Required" | "Donation Confirmed" | ✅ NEW - requires admin confirm |
| Donation Stripe | N/A | "Donation Confirmed" | ⚠️ Requires Stripe webhook |
| Contact Form | N/A (Admin gets: "New Contact Form: ...") | User gets: "Thank you for contacting..." | ✅ Working |

## Mailhog API
| Endpoint | URL |
|----------|-----|
| List messages | `GET http://localhost:8025/api/v2/messages` |
| Clear messages | `DELETE http://localhost:8025/api/v1/messages` |
| SMTP | `localhost:1025` |

## Test Credentials
| Item | Value |
|------|-------|
| Test email format | `test[random8]@example.com` |
| Test password | `TestPassword123!` |
| Test phone | `+41 79 123 45 67` |
| Test name | `Test User` |
| Stripe test card | `4242424242424242` |
| Stripe test expiry | `12/34` |
| Stripe test CVC | `123` |
| Browser | `/usr/bin/brave-browser` |
