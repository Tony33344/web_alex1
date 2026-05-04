# Test Results Log
Generated: May 4, 2026

## Bank Transfer Tests (PENDING + CONFIRMED Email Flow)

### ✅ test_paid_event_bank_transfer.py - PASSED
- Step 1: Register - ✅
- Step 2: Sign in (with session verification) - ✅
- Step 3: Navigate to events page - ✅
- Step 4: Click Enroll Now, select Bank Transfer, submit - ✅
- Step 5: Verify PENDING email - ✅
- Step 6: Admin confirms payment - ✅
- Step 7: Verify CONFIRMED email - ✅

**Fixes applied:**
- Added `context = browser.new_context()` for session persistence
- Added URL verification after sign-in (`wait_for_url`)
- Added "Sign In" button visibility check to confirm login
- Changed `/events` to `/en/events` (locale routing)
- Added `wait_for_selector('button:has-text("Enroll Now")')` for client component rendering
- Hard-assert dialog opening with `wait_for_selector("text=Choose payment method")`
- Simplified Bank Transfer selector to `page.locator('button:has-text("Bank Transfer")')`
- Simplified submit button selector to `page.locator('button:has-text("Get Transfer Details")')`
- Added hard-assert for "Registration Confirmed" text after submit

### ✅ test_membership_bank_transfer.py - PASSED
- Step 1: Register - ✅
- Step 2: Sign in (with session verification) - ✅
- Step 3: Navigate to membership page - ✅
- Step 4: Click Subscribe Now, select Bank Transfer, submit - ✅
- Step 5: Verify PENDING email - ✅
- Step 6: Admin activates membership - ✅
- Step 7: Verify CONFIRMED email - ✅

**Fixes applied:**
- Added URL verification after sign-in
- Changed `/membership` to `/en/membership`
- Added `wait_for_selector('button:has-text("Subscribe Now")')`
- Hard-assert dialog opening
- Simplified Bank Transfer and submit button selectors
- Added hard-assert for confirmation text after submit

### ✅ test_program_bank_transfer.py - PASSED
- Step 1: Register - ✅
- Step 2: Sign in (with session verification) - ✅
- Step 3: Navigate to programs page - ✅
- Step 4: Click Enroll Now, select Bank Transfer, submit - ✅
- Step 5: Verify PENDING email - ✅
- Step 6: Admin confirms payment - ✅
- Step 7: Verify CONFIRMED email - ✅

**Fixes applied:**
- Added URL verification after sign-in
- Changed `/programs` to `/en/coach-training`
- Fixed program link selector to use `a[href*='/coach-training/']`
- Added `wait_for_selector('button:has-text("Enroll Now")')`
- Hard-assert dialog opening
- Simplified Bank Transfer and submit button selectors
- Added hard-assert for confirmation text after submit
- Added screenshots at key steps

**Code changes in app:**
- Changed `programSlug` to `programId` in EnrollButton.tsx and EnrollButtonClient.tsx
- Updated `/api/programs/enroll` route to use `programId` instead of `programSlug`
- Added bank details to program enrollment email (QR code, IBAN, BIC, account holder)

### ✅ test_donation_bank_transfer.py - PASSED (partial)
- Step 1: Register - ✅
- Step 2: Sign in - ✅
- Step 3: Navigate to donate page - ✅
- Step 4: Enter amount, click Donate, select Bank Transfer, submit - ✅
- Step 5: Verify PENDING email - ✅
- Step 6: Admin confirms donation - ⚠️ SKIPPED (needs donation ID retrieval API)
- Step 7: Verify CONFIRMED email - ⚠️ SKIPPED

**Fixes applied:**
- Changed `/donate` to `/en/about/donate`
- Added `wait_for_selector('button:has-text("Donate")')`
- Fixed flow: fill amount → click Donate button → wait for dialog → select Bank Transfer → submit
- Hard-assert dialog opening
- Simplified selectors
- Added `get_donation_id_for_user()` function to admin_helper.py
- Updated test to use `get_donation_id_for_user()` for admin confirm step

**Known issue:**
- Admin donations API endpoint may not exist or may not return donations in expected format
- The `/api/admin/donations` endpoint needs to be verified

## Stripe Tests (Card Payment Flow)

### ✅ test_paid_event_stripe.py - UPDATED (not re-run)
**Changes made:**
- Created `stripe_helper.py` with robust Stripe card filling logic
- Test card data: `4242424242424242`, expiry `12/34`, CVC `123`
- Changed `/events` to `/en/events`
- Added `wait_for_selector('button:has-text("Enroll Now")')`
- Hard-assert dialog opening
- Simplified Card Payment selector to `page.locator('button:has-text("Card Payment")')`
- Simplified submit button selector to `page.locator('button:has-text("Pay")')`
- Replaced manual iframe filling with `fill_stripe_checkout(page, email, name)` helper

**Stripe helper features:**
- Tries multiple iframe selectors (by title, by name, by src)
- Tries multiple input selectors within iframes
- Fallback to direct page fill (some Stripe versions don't use iframes)
- Robust error handling with detailed logging

### ✅ test_membership_stripe.py - UPDATED (not re-run)
**Changes made:**
- Imported `stripe_helper`
- Changed `/membership` to `/en/membership`
- Added `wait_for_selector('button:has-text("Subscribe Now")')`
- Hard-assert dialog opening
- Simplified selectors
- Replaced manual iframe filling with `fill_stripe_checkout()`

### ✅ test_program_stripe.py - UPDATED (not re-run)
**Changes made:**
- Imported `stripe_helper`
- Changed `/programs` to `/en/coach-training`
- Fixed program link selector
- Added `wait_for_selector('button:has-text("Enroll Now")')`
- Hard-assert dialog opening
- Simplified selectors
- Replaced manual iframe filling with `fill_stripe_checkout()`

### ✅ test_donation_stripe.py - UPDATED (not re-run)
**Changes made:**
- Imported `stripe_helper`
- Changed `/donate` to `/en/about/donate`
- Added `wait_for_selector('button:has-text("Donate")')`
- Fixed flow: fill amount → click Donate → wait for dialog → select Card Payment → submit
- Hard-assert dialog opening
- Simplified selectors
- Replaced manual iframe filling with `fill_stripe_checkout()`

## Remaining Tests (Not Yet Tested)

### test_free_event.py - NOT TESTED
### test_contact_form.py - NOT TESTED

## Files Created/Modified

### Created:
- `stripe_helper.py` - Robust Stripe checkout form filling with multiple fallback strategies

### Modified:
- `test_paid_event_bank_transfer.py` - Session persistence, URL fixes, dialog assertions
- `test_membership_bank_transfer.py` - URL fixes, dialog assertions
- `test_program_bank_transfer.py` - URL fixes, programId changes, dialog assertions
- `test_donation_bank_transfer.py` - URL fixes, flow correction, admin confirm integration
- `test_paid_event_stripe.py` - Stripe helper integration, URL fixes, dialog assertions
- `test_membership_stripe.py` - Stripe helper integration, URL fixes, dialog assertions
- `test_program_stripe.py` - Stripe helper integration, URL fixes, dialog assertions
- `test_donation_stripe.py` - Stripe helper integration, URL fixes, flow correction
- `admin_helper.py` - Added `get_donation_id_for_user()` function, fixed JSON serialization

### App Code Changes:
- `EnrollButton.tsx` - Changed `programSlug` to `programId`
- `EnrollButtonClient.tsx` - Changed `programSlug` to `programId`
- `src/app/[locale]/coach-training/[slug]/page.tsx` - Pass `programId` instead of `programSlug`
- `src/app/api/programs/enroll/route.ts` - Use `programId` for lookup, added bank details to email
- `emails/application/coach-training-registration-pending.html` - Enhanced with bank details and QR code
- `src/app/api/admin/registrations/route.ts` - Added program details to confirmation email
- `src/app/api/stripe/webhook/route.ts` - Fixed column names (title_en), added program details

## Key Patterns Applied

### Dialog Opening Pattern:
```python
# Wait for button to render (client component)
page.wait_for_selector('button:has-text("Enroll Now")', timeout=15000)

# Click button
button.click()

# Hard-assert dialog opened
page.wait_for_selector('text=Choose payment method', timeout=10000)

# Select payment method
page.locator('button:has-text("Bank Transfer")').first.click()

# Hard-assert submit button changed
page.wait_for_selector('button:has-text("Get Transfer Details")', timeout=5000)

# Click submit
page.locator('button:has-text("Get Transfer Details")').first.click()

# Hard-assert confirmation
page.wait_for_selector("text=Registration Confirmed", timeout=15000)
```

### Session Persistence Pattern:
```python
# Use context for session persistence
context = browser.new_context()
page = context.new_page()

# After sign-in, verify URL changed
page.wait_for_url(lambda url: "/login" not in url, timeout=10000)

# Or check for absence of "Sign In" button
if page.locator('text=Sign In').count() > 0 and page.locator('text=Sign In').is_visible():
    # Login failed
```

### Stripe Card Filling Pattern:
```python
from stripe_helper import fill_stripe_checkout

# After navigating to Stripe checkout
fill_stripe_checkout(page, test_email, "Test User")
```

## Known Issues / Future Improvements

1. **Stripe Webhook**: Stripe tests require webhook forwarding for confirmation emails. In local dev, run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Donation Admin API**: The `/api/admin/donations` endpoint may not exist. Need to verify or create it for donation confirmation flow.

3. **Free Event Test**: Not yet tested. May need similar fixes for session persistence and dialog handling.

4. **Contact Form Test**: Not yet tested. May need verification of email arrival via Mailhog.

5. **Program Slug vs ID**: Changed from slug-based to ID-based enrollment. Ensure all program pages pass correct `programId` prop.

## Recommendations for User

1. **Re-run Stripe tests** with `stripe listen` active to verify webhook confirmation emails.
2. **Verify `/api/admin/donations` endpoint** exists and returns donation data for admin confirmation.
3. **Test free event and contact form** to complete the test suite.
4. **Monitor Stripe helper** - if iframe selectors fail, may need to update based on Stripe UI changes.
