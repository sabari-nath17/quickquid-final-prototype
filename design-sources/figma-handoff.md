# QuickQuid Figma handoff

## Files

- Design reference file: https://www.figma.com/design/uRftP5IejVtzkMlqbGTXXr
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

## Source of truth

The image layers are implementation captures from the registered prototype routes. The matching source files are in `implementation/`, with WebP copies in `implementation-webp/` and route metadata in `manifest.json`. The Product Flow page contains `quickquid-screen-workflow-map`, an editable Figma frame composed from those real screenshots. Use the route names and source filenames rather than inventing new screens.

## Verification note

All 38 desktop route captures are present in the repository and were placed into the role-family pages and the Product Flow map. Four available mobile captures were placed in `Mobile references`. Native Figma prototype click-links were not generated because the connected Starter-plan Figma MCP allowance was exhausted; the Product Flow page is a visual route map, while the separate role pages remain the screen-by-screen inspection source.
