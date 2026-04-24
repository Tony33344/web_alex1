# Stripe Events Documentation

Source: https://docs.stripe.com/api/events/types

## Overview
Events are our way of letting you know when something interesting happens in your account. When an interesting event occurs, we create an Event object and send it to your registered webhook endpoints.

## Key Event Types for Payments

### Checkout Session Events

#### checkout.session.completed
- **Description**: Occurs when a Checkout Session has been successfully completed.
- **Use case**: Send confirmation email, update order status, grant access to purchased content

#### checkout.session.async_payment_succeeded
- **Description**: Occurs when a payment intent using a delayed payment method finally succeeds.
- **Use case**: Confirm delayed payment completion

#### checkout.session.async_payment_failed
- **Description**: Occurs when a payment intent using a delayed payment method fails.
- **Use case**: Handle failed delayed payments

#### checkout.session.expired
- **Description**: Occurs when a Checkout Session is expired.
- **Use case**: Clean up abandoned carts

### Charge Events

#### charge.succeeded
- **Description**: Occurs whenever a charge is successful.
- **Use case**: Record successful payment

#### charge.failed
- **Description**: Occurs whenever a failed charge attempt occurs.
- **Use case**: Handle failed payments, notify customer

#### charge.refunded
- **Description**: Occurs whenever a charge is refunded, including partial refunds.
- **Use case**: Process refund, update order status

### Invoice Events

#### invoice.created
- **Description**: Occurs whenever a new invoice is created.
- **Use case**: Track invoice creation

#### invoice.finalized
- **Description**: Occurs whenever a draft invoice is finalized and updated to be an open invoice.
- **Use case**: Prepare invoice for payment

#### invoice.paid
- **Description**: Occurs whenever an invoice payment attempt succeeds or an invoice is marked as paid out-of-band.
- **Use case**: Record successful invoice payment

#### invoice.payment_succeeded
- **Description**: Occurs whenever an invoice payment attempt succeeds.
- **Use case**: Send invoice payment confirmation

#### invoice.sent
- **Description**: Occurs whenever an invoice email is sent out.
- **Use case**: Track invoice emails

#### invoice.payment_failed
- **Description**: Occurs whenever an invoice payment attempt fails.
- **Use case**: Handle failed invoice payments, notify customer

### Subscription Events

#### customer.subscription.created
- **Description**: Occurs whenever a customer is signed up for a new plan.
- **Use case**: Send welcome email, grant access

#### customer.subscription.updated
- **Description**: Occurs whenever a subscription changes.
- **Use case**: Handle plan changes

#### customer.subscription.deleted
- **Description**: Occurs whenever a customer's subscription ends.
- **Use case**: Revoke access, send cancellation email

### Customer Events

#### customer.created
- **Description**: Occurs whenever a new customer is created.
- **Use case**: Welcome new customer

#### customer.updated
- **Description**: Occurs whenever any property of a customer changes.
- **Use case**: Sync customer data

## Event Object Structure

```
{
  "id": "evt_1234567890",
  "object": "event",
  "api_version": "2024-12-18.acacia",
  "created": 1234567890,
  "data": {
    "object": { ... } // The object that triggered the event
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_1234567890",
    "idempotency_key": "key_123"
  },
  "type": "checkout.session.completed"
}
```
