# Task ID: 4 — BuyerScreens.tsx

**Agent:** full-stack-developer
**File created:** `/home/z/my-project/src/components/qq/screens/buyer/BuyerScreens.tsx`

## What was built
8 named "use client" React components, each taking no props and reading state from `useQQ()`:

1. **BuyerDashboard** — Screen 02. Action-required banner (rejected payment / funding-pending contract), quick-stats row (active briefs, pending proposals, contracts, pending payments), active engagements list with contextual CTA, briefs grid, empty state with Post a brief + Search talent buttons.
2. **BuyerProfile** — Screens 01.8 + 01.11 + 01.12. Public profile editor (display name, logo color, description, industry, website, hiring categories, visibility switch) + private billing editor (legal name, billing address, GSTIN with regex validation, billing contact). Saved/Invalid/Incomplete/Unsaved status badge. Public preview panel. Privacy copy included.
3. **BuyerTalent** — Screens 03.1+03.2+04.1+04.2+04.3+4.8. Talent | Gigs segmented tabs. Filters sidebar (category, budget band, availability, evidence type). ProfileCard grid → 66/33 detail pane (narrative + sticky commercial). Invite-to-brief modal with private-brief select + scope preview + message + sent/unavailable/duplicate states. GigCard grid → detail with FeeBreakdown + "Request this gig" → routes to `buyer_payment` with `gigId`.
4. **BuyerBriefNew** — Screen 05. Accordion form (Basics / Scope / Budget / Timeline / Visibility). Multi-inputs for deliverables, acceptance criteria, exclusions. Low-budget warning. Visibility radio with private-brief copy. Live preview + FeeBreakdown that recalculates. Autosave indicator (Saving… / Saved just now / Unable to save. Retry.). Publish → upsertBrief → navigate to brief detail. Max-4-milestones note.
5. **BuyerBriefDetail** — Screens 06.1+06.2+06.4+06.7. ATS-lite 40/60 split. Applicant list + selected-applicant detail with cover letter, approach, availability, evidence, FeeBreakdown. Counter-offer simulator (accept / counter / custom) with live Buyer fee + total recalc. Decline modal with DECLINE_REASONS + private note. Create offer → 2-milestone contract (40/60). Brief expiry banner (approaching/archived/republished) with Republish/Edit/Contact Support.
6. **BuyerContract** — Screens 08+10+11. Tabs: Workroom / Offer sheet / Completion / Disputes. Immutable offer sheet (FeeBreakdown, milestones max 4 with tooltip, cancellation terms). Funding interlock banner. Per-milestone cards with MilestoneStepper, acceptance checklist, delivery vault (Figma/repo/PDF), inline revision form, version history drawer, "Accept milestone" button with required copy → queues payout (not instant). Pro inactivity escalation banner. Completion tab: tax status, payout status, private double-blind review, defect window, Enterprise TDS overlay (labelled future), invoice/tax mapping. Disputes tab: DisputeDialog (DISPUTE_CATEGORIES, affected milestone, narrative, requested resolution, desired outcome, evidence) + mutual cancellation form + rehire flow.
7. **BuyerPayment** — Screens 09.1+09.4+09.7+09.8+09.9. Approved payment instructions (left) + structured evidence form (right). UTR required, amount, date, method (NEFT/IMPS/RTGS/UPI), optional screenshot via EvidenceDropzone. Required copy: "Submit the UTR or transaction reference first. Supporting screenshots are optional and may contain sensitive information." PaymentTracker. Rejected recovery alert with PAYMENT_REJECTION_REASONS. Over/under resolver (Hold/Apply/Manual refund/Reject). Chargeback alert. Cancel & refund section ("We do not guarantee a refund"). Sticky bottom CTA shows pending PAY-xxxx reference. Submit → status `under_admin_verification` + audit + navigate back.
8. **BuyerMessages** — Screen 07. Contract select. 60/40 chat / immutable scope summary. Banner: "Admin Support may review this workspace if a dispute is filed." Scope-update modal (requested change, fee delta, timeline delta, criteria impact, reason) with Accept/Decline/Request changes on inbound changes. File attachment (max 25MB, blocks executables, progress/retry/remove/invalid/oversized). Circumvention blocker using `detectCircumvention()` — surfaces alert with Edit / Report false positive / Support paths, does NOT silently delete.

## Spec rules honored
- Pro pays 0% commission — always separate ₹0 line in FeeBreakdown.
- Buyer fee 14% beta — `buyerTotal = proFee + buyerFee(proFee)`.
- Max 4 milestones per contract (note in brief form, tooltip in offer sheet).
- Taxes = "Calculated by Finance if applicable" — never hardcoded.
- Funding interlock: Pro cannot begin work until payment confirmation.
- Milestone accept → payout QUEUED (not instant). Copy: "Payout queued for Admin processing."
- Money movement / cancellation / dispute = modals. Low-risk confirmations = toasts.
- Every payment action shows immutable PAY-xxxx reference.
- All routing via `navigate(view, params)`. No absolute paths.
- Circumvention detected, not silently deleted.
- No indigo/blue primary; state tones from StatusBadge (emerald/amber/orange/red).
- Responsive: stacks on mobile, commercial summary above primary action, sticky CTA without covering content.
- Touch targets ≥44px. Semantic headings. ARIA labels on icon-only buttons.

## Lint / type status
- `bun run lint`: 0 errors in BuyerScreens.tsx (1 pre-existing warning in RoleAuthScreens.tsx).
- `npx tsc --noEmit`: 0 errors in BuyerScreens.tsx.

## What's next
Wire the 8 components into the SPA router (app/page.tsx or wherever the orchestrator chooses to dispatch on `view`). Suggested mapping:
- `buyer_dashboard` → `<BuyerDashboard />`
- `buyer_profile` → `<BuyerProfile />`
- `buyer_talent` → `<BuyerTalent />`
- `buyer_brief_new` → `<BuyerBriefNew />`
- `buyer_brief_detail` → `<BuyerBriefDetail />` (reads `viewParams.briefId`)
- `buyer_contract` → `<BuyerContract />` (reads `viewParams.contractId`)
- `buyer_payment` → `<BuyerPayment />` (reads `viewParams.contractId` or `viewParams.gigId`)
- `buyer_messages` → `<BuyerMessages />` (reads `viewParams.contractId`)
