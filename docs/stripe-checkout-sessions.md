# Stripe Checkout Sessions Documentation

Source: https://docs.stripe.com/api/checkout/sessions

## Overview
Creates a Checkout Session object to accept payments or set up subscriptions.

## Create a Checkout Session

### Parameters

#### automatic_tax (object)
Settings for automatic tax lookup for this session and resulting payments, invoices, and subscriptions.

#### client_reference_id (string)
A unique string to reference the Checkout Session. This can be a customer ID, a cart ID, or similar, and can be used to reconcile the session with your internal systems.
- Maximum length: 200 characters

#### customer (string)
ID of an existing Customer, if one exists.

**In payment mode:**
- The customer's most recently saved card payment method will be used to prefill the email, name, card details, and billing address on the Checkout page

**In subscription mode:**
- The customer's default payment method will be used if it's a card, otherwise the most recently saved card will be used
- A valid billing address, billing name and billing email are required on the payment method for Checkout to prefill the customer's card details

**Important:**
- If the Customer already has a valid email set, the email will be prefilled and not editable in Checkout
- If the Customer does not have a valid email, Checkout will set the email entered during the session on the Customer
- If blank for Checkout Sessions in subscription mode or with customer_creation set as always in payment mode, Checkout will create a new Customer object based on information provided during the payment flow
- You can set `payment_intent_data.setup_future_usage` to have Checkout automatically attach the payment method to the Customer you pass in for future reuse

#### customer_email (string)
If provided, this value will be used when the Customer object is created. If not provided, customers will be asked to enter their email address. Use this parameter to prefill customer data if you already have an email on file. To access information about the customer once a session is complete, use the customer field.
- Maximum length: 800 characters

#### line_items (array of objects) - Required conditionally
A list of items the customer is purchasing. Use this parameter to pass one-time or recurring Prices. The parameter is required for payment and subscription mode.

**For payment mode:**
- Maximum of 100 line items
- Recommended to consolidate line items if there are more than a few dozen

**For subscription mode:**
- Maximum of 20 line items with recurring Prices and 20 line items with one-time Prices
- Line items with one-time Prices will be on the initial invoice only

#### metadata (object)
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format.

#### mode (enum) - Required
The mode of the Checkout Session. Pass subscription if the Checkout Session includes at least one recurring item.

Possible values:
- `payment` - Accept one-time payments for cards, iDEAL, and more
- `setup` - Save payment details to charge your customers later
- `subscription` - Use Stripe Billing to set up fixed-price subscriptions

#### return_url (string) - Required conditionally
The URL to redirect your customer back to after they authenticate or cancel their payment on the payment method's app or site. This parameter is required if ui_mode is embedded or custom and redirect-based payment methods are enabled on the session.

#### success_url (string) - Required conditionally
The URL to which Stripe should send customers when payment or setup is complete. This parameter is not allowed if ui_mode is embedded or custom.

#### ui_mode (enum)
The UI mode of the Session. Defaults to hosted.

Possible values:
- `hosted` - The Checkout Session is displayed on a hosted page that customers get redirected to
- `embedded` - The Checkout Session is displayed as an embedded form on your website
- `elements` - The Checkout Session is displayed using Checkout elements on your website

## The Checkout Session Object

The Checkout Session object represents your customer's session as they pay for your product or service via Checkout.

### Key Attributes
- `id` - Unique identifier for the object
- `customer` - ID of the customer this Checkout Session belongs to
- `customer_email` - The email address of the customer
- `mode` - The mode of the Checkout Session (payment, subscription, or setup)
- `payment_status` - The status of the payment (requires_payment_method, requires_confirmation, requires_action, processing, succeeded, canceled)
- `status` - The status of the Checkout Session (open, expired, complete)
- `success_url` - The URL the customer is directed to after the payment is complete
- `cancel_url` - The URL the customer is directed to if they cancel the payment
- `metadata` - Set of key-value pairs attached to the object
