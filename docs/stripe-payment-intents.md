# Stripe Payment Intents Documentation

Source: https://docs.stripe.com/api/payment_intents

## Overview
A PaymentIntent guides you through the process of collecting a payment from your customer. We recommend that you use the Payment Intents API to build a custom payment flow.

## Create a PaymentIntent

### Parameters

#### amount (integer) - Required
Amount intended to be collected by this PaymentIntent. A positive integer representing how much to charge in the smallest currency unit (e.g., 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency).
- Minimum amount: $0.50 US or equivalent in charge currency
- Supports up to eight digits (e.g., 99999999 for a USD charge of $999,999.99)

#### currency (enum) - Required
Three-letter ISO currency code, in lowercase. Must be a supported currency.

#### automatic_payment_methods (object)
When you enable this parameter, this PaymentIntent accepts payment methods that you enable in the Dashboard and that are compatible with this PaymentIntent's other parameters.

#### confirm (boolean)
Set to true to attempt to confirm this PaymentIntent immediately. This parameter defaults to false. When creating and confirming a PaymentIntent at the same time, you can also provide the parameters available in the Confirm API.

#### customer (string)
ID of the Customer this PaymentIntent belongs to, if one exists.
- Payment methods attached to other Customers cannot be used with this PaymentIntent
- If setup_future_usage is set and this PaymentIntent's payment method is not card_present, then the payment method attaches to the Customer after the PaymentIntent has been confirmed

#### description (string)
An arbitrary string attached to the object. Often useful for displaying to users.

#### metadata (object)
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format.

#### receipt_email (string)
Email address to send the receipt to. If you specify receipt_email for a payment in live mode, you send a receipt regardless of your email settings.

## The PaymentIntent Object

### Key Attributes
- `id` - Unique identifier for the object
- `amount` - Amount intended to be collected
- `currency` - Three-letter ISO currency code
- `customer` - ID of the Customer this PaymentIntent belongs to
- `description` - Description of the PaymentIntent
- `metadata` - Set of key-value pairs
- `status` - Status of the PaymentIntent (requires_payment_method, requires_confirmation, requires_action, processing, requires_capture, canceled, succeeded)
- `payment_method` - The payment method used for this PaymentIntent
- `receipt_email` - Email address that the receipt was sent to
