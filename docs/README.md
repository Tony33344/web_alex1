# Stripe Documentation

This folder contains relevant Stripe API documentation for the project.

## Files

- **stripe-checkout-sessions.md** - Documentation for Stripe Checkout Sessions API
  - Creating checkout sessions for payments and subscriptions
  - Customer and customer_email parameters
  - Session object attributes

- **stripe-customers.md** - Documentation for Stripe Customers API
  - Creating and managing customer objects
  - Customer attributes (email, name, metadata)
  - Payment methods

- **stripe-payment-intents.md** - Documentation for Stripe Payment Intents API
  - Creating and confirming payment intents
  - Payment intent statuses
  - Receipt email parameter

- **stripe-prices.md** - Documentation for Stripe Prices API
  - Creating prices for products
  - Recurring vs one-time prices
  - Billing schemes

- **stripe-events.md** - Documentation for Stripe Events/Webhooks
  - Key event types for payment confirmations
  - Event object structure
  - Checkout, charge, invoice, and subscription events

## Key Concepts for Confirmation Emails

Based on the documentation, confirmation emails can be implemented in several ways:

### 1. Using Stripe's Built-in Receipts (Simple)
- Enable "Successful payments" in Stripe Settings → Emails
- The customer object must have an email address (already implemented)
- Works in LIVE mode only (test mode doesn't send real emails)
- Limited customization

### 2. Using receipt_email Parameter
- Pass `receipt_email` when creating a PaymentIntent
- Sends receipt regardless of email settings
- Still Stripe-branded, limited customization

### 3. Custom Emails via Webhooks (Recommended)
- Listen to `checkout.session.completed` or `charge.succeeded` events
- Use an email service (Resend, SendGrid, etc.) to send branded emails
- Full customization of email content and design
- Works with any email service

### Key Webhook Events to Handle
- **checkout.session.completed** - Send confirmation after successful checkout
- **invoice.payment_succeeded** - Send invoice payment confirmation
- **customer.subscription.created** - Send welcome email for subscriptions

## Recommended Implementation

For this project, the recommended approach is:
1. Use `checkout.session.completed` webhook event
2. Use Resend (already installed) to send custom branded emails
3. Include event/program details, date, price in the email
4. Optionally include invoice link for subscriptions
