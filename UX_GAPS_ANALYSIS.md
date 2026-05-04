# UX Gap Analysis - Email Notifications & User Experience

## Executive Summary
Review of the Infinity Role Teachers web platform identified **12 missing email notifications** and several UX gaps in the user journey. The platform has good coverage for paid registrations via Stripe, but gaps exist for free registrations, bank transfers, waitlists, and post-verification flows.

## Current Email Notifications (Working)

| User Action | Email Sent | Method |
|-------------|-----------|--------|
| Registration | Verification email | Supabase |
| Event registration (Stripe) | Confirmation | Webhook |
| Event registration (Bank Transfer) | Pending payment | API route (just added) |
| Program enrollment (Stripe) | Confirmation | Webhook |
| Program enrollment (Bank Transfer) | Pending payment | API route (just added) |
| Membership (Stripe) | Confirmation | Webhook |
| Contact form | Confirmation to user + notification to admin | API route |

## Missing Email Notifications (High Priority)

### 1. Welcome Email After Email Verification
- **Status**: Template exists (`welcome.html`) but not sent
- **Impact**: Users have no warm welcome after verifying their email
- **Location**: Should be sent in `src/app/[locale]/auth/callback/route.ts` after successful verification
- **Priority**: HIGH

### 2. Free Event Registration Confirmation
- **Status**: No email sent for free events
- **Impact**: Users who register for free events receive no confirmation
- **Location**: `src/app/api/events/register/route.ts` - add email for `isFree` case
- **Priority**: HIGH

### 3. Free Program Enrollment Confirmation
- **Status**: No email sent for free programs
- **Impact**: Users who enroll in free programs receive no confirmation
- **Location**: `src/app/api/programs/enroll/route.ts` - add email for `isFree` case
- **Priority**: HIGH

### 4. Membership Bank Transfer Confirmation
- **Status**: API route exists but no email sent
- **Impact**: Users choosing bank transfer for membership receive no reference or instructions
- **Location**: `src/app/api/membership/bank-transfer/route.ts`
- **Priority**: HIGH

### 5. Event Waitlist Confirmation
- **Status**: No email sent when joining waitlist
- **Impact**: Users don't receive confirmation they're on the waitlist
- **Location**: `src/app/api/events/waitlist/route.ts`
- **Priority**: HIGH

### 6. Event Waitlist Notification (Spot Available)
- **Status**: No notification when spot becomes available
- **Impact**: Users on waitlist are never notified when spots open up
- **Location**: Need webhook or scheduled job to check waitlist
- **Priority**: MEDIUM

## Missing Email Notifications (Medium Priority)

### 7. Password Reset Email
- **Status**: Template exists (`password-reset.html`) - verify if sent
- **Impact**: Users can't reset password if email not sent
- **Location**: Supabase handles this - verify configuration
- **Priority**: MEDIUM

### 8. Subscription Cancellation Notification
- **Status**: No email sent when user cancels membership
- **Impact**: Users don't receive confirmation of cancellation
- **Location**: Stripe webhook - add handling for `customer.subscription.deleted`
- **Priority**: MEDIUM

### 9. Subscription Renewal Reminder
- **Status**: No reminder before subscription renews
- **Impact**: Users may be surprised by unexpected charges
- **Location**: Need scheduled job to check upcoming renewals
- **Priority**: MEDIUM

### 10. Membership Expiration Reminder
- **Status**: No reminder before membership expires
- **Impact**: Users may lose access unexpectedly
- **Location**: Need scheduled job to check expiring memberships
- **Priority**: MEDIUM

### 11. Email Change Confirmation
- **Status**: Not applicable (no email change feature)
- **Impact**: N/A
- **Priority**: LOW

### 12. Program Waitlist (if exists)
- **Status**: No program waitlist feature detected
- **Impact**: N/A
- **Priority**: LOW

## Other UX Gaps

### Registration Flow
- **Gap**: After email verification, users are redirected to login but receive no welcome message
- **Current**: "Check Your Email" → verification → redirect to login with `confirmed=true`
- **Improvement**: Send welcome email after verification, show welcome screen on first login

### Payment Method Selection
- **Gap**: Bank transfer users don't receive immediate feedback with payment instructions
- **Current**: Returns reference number but no email with bank details
- **Improvement**: Send pending payment email immediately with bank details and reference

### Waitlist Experience
- **Gap**: No confirmation when joining waitlist, no notification when spot opens
- **Current**: Success message in UI only
- **Improvement**: Send waitlist confirmation, implement notification system for spot availability

## Recommended Implementation Order

1. **Phase 1 (Critical - 1-2 hours):**
   - Welcome email after email verification
   - Free event registration confirmation
   - Free program enrollment confirmation
   - Membership bank transfer confirmation
   - Event waitlist confirmation

2. **Phase 2 (Important - 2-3 hours):**
   - Event waitlist notification system
   - Verify password reset email flow
   - Subscription cancellation notification

3. **Phase 3 (Nice to Have - 4+ hours):**
   - Subscription renewal reminders
   - Membership expiration reminders
   - Email change confirmation (if feature added)

## Technical Notes

### Email Templates Needed
- `welcome.html` - exists, just needs to be sent
- `free-event-registration.html` - new template needed
- `free-program-enrollment.html` - new template needed
- `membership-pending.html` - new template needed
- `event-waitlist-confirmation.html` - new template needed
- `event-waitlist-available.html` - new template needed
- `subscription-cancelled.html` - new template needed
- `subscription-renewal-reminder.html` - new template needed
- `membership-expiring-soon.html` - new template needed

### Database Considerations
- Waitlist notification system needs tracking of sent notifications
- Subscription reminders need tracking of reminder schedule
- Consider adding `notifications` table for user notifications

## Summary

The platform has a solid foundation for paid registrations via Stripe, but significant gaps exist for:
- Free registrations (no confirmations)
- Bank transfers (missing membership flow)
- Waitlist management (no confirmations or notifications)
- Post-verification experience (no welcome email)

Implementing Phase 1 would address the most critical user experience gaps and ensure users receive confirmation for all major actions on the platform.
