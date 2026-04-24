# Stripe Customers Documentation

Source: https://docs.stripe.com/api/customers

## Overview
Customer objects allow you to perform recurring charges and track multiple charges that are associated with the same customer.

## Create a Customer

### Parameters

#### address (object) - Required if calculating taxes
The customer's address. Learn about country-specific requirements for calculating tax.

#### description (string)
An arbitrary string that you can attach to a customer object. It is displayed alongside the customer in the dashboard.

#### email (string)
Customer's email address. It's displayed alongside the customer in your dashboard and can be useful for searching and tracking.
- Maximum length: 512 characters

#### metadata (object)
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format.

#### name (string)
The customer's full name or business name.
- Maximum length: 256 characters

#### payment_method (string)
The ID of the PaymentMethod to attach to the customer.

#### phone (string)
The customer's phone number.
- Maximum length: 20 characters

#### shipping (object)
The customer's shipping information. Appears on invoices emailed to this customer.

#### tax (object) - Recommended if calculating taxes
Tax details about the customer.

## The Customer Object

### Key Attributes
- `id` - Unique identifier for the object
- `email` - Customer's email address
- `name` - Customer's full name or business name
- `description` - Description of the customer
- `metadata` - Set of key-value pairs attached to the object
- `default_payment_method` - The default payment method for this customer
- `invoice_prefix` - The prefix for the customer's invoice numbers
- `shipping` - Shipping information
- `address` - Customer's address
- `phone` - Customer's phone number
