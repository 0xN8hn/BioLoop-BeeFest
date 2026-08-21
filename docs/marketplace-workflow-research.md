# BioLoop marketplace workflow research

BioLoop should be structured as a circular-material marketplace rather than a universal dashboard. The product needs a discrete listing/marketplace/checkout/delivery flow, so no role is forced to create, buy, dispatch, and analyse within one screen.

## Interaction patterns adapted for BioLoop

| Reference pattern | BioLoop implementation |
|---|---|
| Shipping fee is visible on product detail and checkout before payment.[^1] | A recycler sees material price per kilogram, estimated transport fee, processing/service fee, and checkout total before confirming an order. |
| An order is distinct from its shipment package and follows explicit fulfillment states.[^2] | A `marketplace_order` holds commercial terms; its linked waste listing tracks physical pickup, transit, arrival, and completion. |
| A driver-facing order progresses through assignment, collection, delivery, and received states.[^3] | The driver job view shows producer, receiver, package weight, pickup fee, destination, and one next status action. |
| Fulfillment work needs a visible deadline and exception state.[^4] | The producer’s order view shows pickup window, pickup status, and an exception flag rather than generic KPI cards. |

## BioLoop lifecycle

`DRAFT LISTING → MARKETPLACE LIVE → CHECKOUT PENDING → PAID / READY FOR PICKUP → DRIVER ASSIGNED → PICKED UP → IN TRANSIT → RECEIVED BY PROCESSOR → COMPLETED / PAID OUT`

The workflow accommodates BSF feedstock, fish-feed input, composting input, and other organic-resource buyers. The producer earns sale proceeds and BioPoints; the processor turns sourced material into derivative products; the driver earns a delivery fee; and future creator/affiliate tracking can be linked through referral metadata.

[^1]: [Shopee Help: Shipping Fee](https://help.shopee.com.my/4/article/78417-Shipping-Fee-How-do-I-check-the-shipping-fees-for-my-order)
[^2]: [Shopee Open Platform: Order Management](https://open.shopee.com/developer-guide/229)
[^3]: [Gojek: GoMart order statuses](https://www.gojek.com/en-id/help/gomart/status-order-gomart)
[^4]: [Shopee Seller Center: Fulfillment policy FAQ](https://seller.shopee.ph/edu/article/15941/shopee-fulfillment-policy-faq)
