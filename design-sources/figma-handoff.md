# QuickQuid Figma handoff

## Files

- Design reference file: https://www.figma.com/design/uRftP5IejVtzkMlqbGTXXr
- Visual workflow map frame: https://www.figma.com/design/uRftP5IejVtzkMlqbGTXXr/QuickQuid-%E2%80%94-Product-Flow-Reference?node-id=8-101
- Complete workflow map: https://www.figma.com/board/dfkTe9hjefuQSY570lvnmj

## Figma pages

| Page | Contents |
| --- | --- |
| Shared references | The initial shared route captures plus notifications |
| Visitor + Readiness | Role selection, auth, guest readiness, readiness summary, readiness dashboard, public profile, public brief, support |
| Buyer | Dashboard, onboarding, profile, talent, brief builder/detail, contract, payment, messages |
| Pro | Dashboard, briefs, profile, proposals, contract, payouts, gigs, gig builder, gig detail |
| Admin | Operations, KYC, payments, payouts, refunds, disputes, Trust & Safety, audit, moderation, notes, media lifecycle |
| Mobile references | Available mobile captures for readiness, Buyer dashboard/brief, and Pro profile |
| Product Flow | Editable visual map containing all 38 implementation captures, grouped into role lanes with primary-transition arrows |
| Workflow — Visitor + Readiness | Readable full-preview board for the visitor and readiness route sequence |
| Workflow — Buyer | Readable full-preview board for the Buyer route sequence |
| Workflow — Pro | Readable full-preview board for the Pro route sequence |
| Workflow — Admin | Readable full-preview board for Admin operations and verification |
| Workflow — Mobile | Readable full-preview board for the four available mobile references |

## Source of truth

The image layers are implementation captures from the registered prototype routes. The matching source files are in `implementation/`, with WebP copies in `implementation-webp/` and route metadata in `manifest.json`. The Product Flow page contains `quickquid-readable-screen-workflow-map`, an editable full-coverage overview frame composed from those real screenshots. The five Workflow pages contain larger, readable role boards. Use the route names and source filenames rather than inventing new screens.

## Verification note

All 38 desktop route captures are present in the repository and were placed into the role-family pages, the Product Flow overview, and the relevant readable Workflow board. Four available mobile captures were placed in `Mobile references` and `Workflow — Mobile`. Tall screens use a contained preview so the screenshot is complete rather than cropped. Native Figma prototype click-links were not generated because the connected Starter-plan Figma MCP allowance was exhausted; the Workflow pages are visual route maps, while the role pages remain the screen-by-screen inspection source.
