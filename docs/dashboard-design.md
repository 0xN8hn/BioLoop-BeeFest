# BioLoop operational dashboard system

## Chosen direction: Field Operations Console

BioLoop dashboards will behave like an operations product, not a campaign landing page. The interface takes the task-first concentration of a seller console and the quick, role-aware navigation of a mobility app, while retaining BioLoop’s charcoal, clay, and oatmeal brand materials.

### Core rules

1. **No hero language inside the product.** The workspace begins with a compact greeting, role identity, live point balance, and the next meaningful action.
2. **One persistent navigation system.** Desktop uses a dark sidebar; mobile turns the same actions into bottom navigation. Each role shares the structure but receives a different primary action.
3. **Map is operational.** It occupies the central working area beside a prioritised queue, not a decorative card.
4. **Status is actionable.** Labels are paired with a next action or queue position; they are never decorative badges.
5. **Points must originate from profile data.** The interface exposes `total_points` or `points` when present and never invents a balance.

### Layout grammar

| Area | Desktop behavior | Mobile behavior |
|---|---|---|
| Navigation | 232px charcoal sidebar with role-specific modules | Fixed bottom bar with Home, Queue, Map, Points, Profile |
| Top bar | Search-free utility bar with date, points, and profile | Compact title and notification affordance |
| Main workspace | 12-column grid: summary strip, map/work queue, data table | Stacked summary, map, then queue |
| Primary action | One clay call-to-action, positioned near the active task | Persistent bottom action above navigation |

### Role priorities

| Role | Main workspace | Primary action | Supporting information |
|---|---|---|---|
| Producer | My listings + pickup map | Buat listing | Pickup state, completed kilograms, points |
| Recycler | Available supply map + claim feed | Klaim bahan | Claim capacity, claimed stock, points |
| Driver | Pickup route map + route queue | Mulai pengantaran | Ready pickups, in-transit jobs, points |
| Admin | System map + exceptions table | Review operasi | Partner count, open listings, transit exceptions |
