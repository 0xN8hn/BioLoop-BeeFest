# BioLoop dashboard research notes

The redesign takes inspiration from the operational clarity of seller and mobility applications without reproducing their visual identity. Shopee Seller Center prioritizes status-at-a-glance, role-specific shortcuts, and a dedicated workspace where seller tasks are not mixed with consumer activity.[^1] Gojek’s product flows favour a compact primary navigation, task-oriented screens, and direct access to profile/business controls rather than marketing copy.[^2][^3]

## Design decisions

| Principle | BioLoop application |
|---|---|
| Operational home, not marketing page | Remove oversized headlines and explanatory paragraphs from dashboards. Use a compact workspace title, live counts, and the next task. |
| Status-first scanning | Present listing lifecycle counts and actionable rows before secondary insights. A status is always paired with a next action. |
| Persistent navigation | Use a narrow charcoal sidebar on desktop and bottom navigation on mobile, with role-specific primary actions. |
| Map as a working surface | Restore the existing Leaflet map as an operational panel showing listings or pickup jobs, not a decorative section. |
| No synthetic social proof | Show only records, points, and totals returned from the operational data model. |
| Role-specific context | Producer publishes and follows pickups; recycler claims supply; driver advances jobs; admin monitors exceptions and system flow. |

[^1]: [Shopee Seller Center App](https://seller.shopee.ph/edu/article/26043)
[^2]: [Gojek Android product flows](https://pageflows.com/android/products/gojek/)
[^3]: [Gojek business profile workflow](https://www.gojek.com/en-id/help/gocar/what-is-an-individual-business-profile)
