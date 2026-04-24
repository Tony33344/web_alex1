# Stripe Prices Documentation

Source: https://docs.stripe.com/api/prices

## Overview
Prices define how much and how frequently to charge for products. This includes how much the product costs, what currency to use, and the optional interval to use for recurring products.

## Create a Price

Creates a new Price for an existing Product. The Price can be recurring or one-time.

### Parameters

#### currency (enum) - Required
Three-letter ISO currency code, in lowercase. Must be a supported currency.

#### unit_amount (integer) - Required
A positive integer representing how much to charge in the smallest currency unit (e.g., 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency).

#### product (string) - Required
The ID of the product that this price will be associated with.

#### recurring (object)
The recurring component of a price for fixed interval plans.

**interval** (enum) - Required when recurring is specified
The frequency at which a subscription is billed. One of `day`, `week`, `month`, or `year`.

**interval_count** (integer)
The number of intervals between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months. Default: 1

#### billing_scheme (enum)
How to compute the price per period. Can be either `per_unit` or `tiered`.
- `per_unit` - Indicates that the fixed amount specified in unit_amount will be charged per unit
- `tiered` - Indicates that the unit pricing will be computed using a tiering strategy

#### metadata (object)
Set of key-value pairs that you can attach to an object.

## The Price Object

### Key Attributes
- `id` - Unique identifier for the object
- `currency` - Three-letter ISO currency code
- `unit_amount` - The unit amount in cents to be charged
- `product` - The ID of the product this price is associated with
- `type` - One of `one_time` or `recurring`
- `billing_scheme` - Describes how to compute the price per period
- `recurring` - The recurring component of a price
- `metadata` - Set of key-value pairs attached to the object
