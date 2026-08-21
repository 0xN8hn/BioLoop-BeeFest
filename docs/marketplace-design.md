# BioLoop marketplace product architecture

## Product framing

BioLoop is a marketplace for verified organic material. Producers publish material in a dedicated listing workflow; processors and other qualified buyers browse and purchase supply in a dedicated marketplace; drivers fulfill a delivery job; every participant sees the same physical and commercial progress through a shared order tracker.

## Commercial model

| Participant | What they receive | Record of truth |
|---|---|---|
| Producer | Material sale proceeds, BioPoints, and disposal-cost savings | `marketplace_orders.producer_amount` and `payouts` |
| Processor / buyer | Organic input for BSF, fish feed, compost, or other permitted reuse | `marketplace_orders` and `waste_listings` |
| Driver | Delivery fee and SLA incentive where configured | `marketplace_orders.delivery_fee` and `payouts` |
| Future affiliate / creator | Referral commission | A future `referrals` module, intentionally not fabricated in the first release |

## Data model

`waste_listings` remains the material catalogue and physical inventory record. `marketplace_orders` becomes the commercial commitment, while `order_timeline` stores the status history visible to all parties. `payouts` records planned/paid funds for producers and drivers.

## Role journeys

| Role | Home focus | Separate work areas |
|---|---|---|
| Producer | Upcoming collection and current sale status | New listing, My listings, Order tracking, Payouts |
| Recycler / buyer | Material discovery and current purchases | Marketplace, Material detail, Checkout, Orders, Derived products later |
| Driver | Next assigned pickup and delivery fee | Job inbox, Job detail, Route status, Earnings history |
| Admin | Exceptions and marketplace health | Orders, fulfillment exceptions, partners, payout review |

## Delivery and tracking states

`Menunggu pembayaran → Dibayar / siap dijemput → Driver ditugaskan → Sudah diambil → Dalam perjalanan → Diterima pengolah → Selesai / payout diproses`

Every status writes a timeline event. The same tracker is shown to producer, buyer, driver, and admin with participant-specific actions.
