# Task ID 5 — full-stack-developer — Pro-side screens

## What I built

Created `/home/z/my-project/src/components/qq/screens/pro/ProScreens.tsx` (~2000 lines, `"use client"`) exporting 9 named React components, each taking no props and reading state/actions from `useQQ()`:

1. **ProDashboard** — sticky funding-pending banner, 4 stat cards, active engagements list, payout readiness interlock, proposal limit card, profile completion interlock.
2. **ProProfile** — tabbed (Profile / Payout / Preview). Full editor, payout details with pending_reverification flow, public preview with Buyer/Pro view toggle.
3. **ProBriefs** — filtered BriefCard feed + brief detail view with FeeBreakdown; Apply routes to pro_proposals with briefId.
4. **ProProposals** — list with status states + full proposal form (accept/counter, 100-char min cover, evidence required, circumvention detection).
5. **ProContract** — tabbed (Overview / Workroom / Disputes / Reviews / Invoice). Accept/Decline/Counter-offer, milestone workroom with submit-deliverable/revision/version drawer, dispute + counterclaim, double-blind review + appeal, invoice & IP ownership.
6. **ProPayouts** — history table + mobile cards + payout slip dialog (never hardcodes TDS rate).
7. **ProGigs** — v0.2-labelled management table with pause/duplicate/archive actions.
8. **ProGigNew** — v0.2-labelled 6-step wizard (Basics / Service Scope / Deliverables / Pricing / Requirements / Preview) with sticky CTA bar.
9. **ProGigDetail** — preview + moderation status with statusMeta + actions.

## Critical rules honored
- Pro commission always ₹0; Buyer fee 14% beta shown via FeeBreakdown.
- "Do not begin work until payment is confirmed" shown whenever funding_pending.
- Max 4 milestones; milestone accept → payout_queued (manual, not instant).
- Taxes "Calculated by Finance if applicable" — never hardcoded.
- v0.2 gig screens clearly labelled.
- Toasts for low-risk; modals/dialogs/sheets for money movement, disputes, payout slip, version history.
- Every payout has immutable reference ID; payout slip never hardcodes TDS rate.
- navigate(view, params) used throughout; responsive (stacks on mobile, sticky CTA bottom bar).
- No indigo or blue as primary brand color.

## Verification
- `bun run lint` clean for new file (0 errors / 0 warnings; 1 pre-existing warning in RoleAuthScreens.tsx untouched).
- `tsc --noEmit --skipLibCheck` produces 0 errors for the new file (pre-existing errors in other agents' files untouched).

## Downstream notes
- The 9 components are ready to be wired into the SPA router by another task. View names match the `ViewName` union in `src/lib/qq/types.ts`: `pro_dashboard`, `pro_profile`, `pro_briefs`, `pro_proposals`, `pro_contract`, `pro_payouts`, `pro_gigs`, `pro_gig_new`, `pro_gig_detail`.
- `viewParams` consumed: `contractId` (pro_contract), `briefId` (pro_proposals), `gigId` (pro_gig_new, pro_gig_detail).
