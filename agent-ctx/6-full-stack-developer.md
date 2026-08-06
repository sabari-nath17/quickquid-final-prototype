# Task ID 6 — full-stack-developer — Admin Screens

## Task
Build all 10 admin screens in a single file `src/components/qq/screens/admin/AdminScreens.tsx`:
AdminOperations, AdminKyc, AdminPayments, AdminPayouts, AdminRefunds, AdminDisputes, AdminTrust, AdminAudit, AdminGigModeration, AdminNotes.

## What was built

### File: `/home/z/my-project/src/components/qq/screens/admin/AdminScreens.tsx`
- `"use client"` at top; ~2,500 lines; 10 named exports; each takes no props and reads from `useQQ()`.
- Shared in-file helpers:
  - `ROLE_LABELS` map.
  - Permission predicates: `canVerifyPayments`, `canTriggerPayouts`, `canProcessRefunds`, `canSuspend`, `canMakeRiskDecisions`, `canMediateDisputes`, `canReassign`, `canProcessKyc`, `canViewAudit`, `canExportPayoutBatches`, `canModerateGigs`, `canRevealMasked`, `canManageDeletionExport`.
  - `PermissionDenied` component — shows allowed roles + "your current role cannot perform this action".
  - `ReasonDialog` — generic reason modal with optional category select; used for reject / escalate / request-info / masked-reveal flows.
  - `ConfirmDialog` — generic confirm modal.
  - `slaTone` / `slaLabel` — compute SLA state (normal/approaching/breached/escalation-due).

### Components

1. **AdminOperations** — 8 queue grid cards (KYC, Payments, Payouts, Refunds, Disputes, Support, Trust & Safety, SLA breaches) + unified SLA queue (QueueTable) aggregating all open items. Role-aware emphasis banner. Maker-checker policy card.

2. **AdminKyc** — 4 tabs: KYC queue (QueueTable → right Sheet detail), Risk flag view (01.6), Account deletion (12.11), Personal data export (12.12). MaskedField with reason-gated reveal that creates `maskedReveal:true` audit event. Actions: Approve / Reject (preset reasons incl. "Image is too blurry…") / Request info / Escalate. Risk-flag view: investigate / request info / reject / approve-with-rationale. Account deletion: 6-step flow with per-record-type retention language + obligation checks. Data export: 6-step flow with Risk scope review + other-party redaction note + JSON/CSV + time-limited link.

3. **AdminPayments** — 3 tabs: Bank matcher (09.3–09.5) with split pane (buyer UTR vs admin bank evidence), Over/under resolver (09.8 — ₹35k vs ₹34.2k surplus ₹800, 4 options, no wallet), Chargeback queue (09.9 with states + "Payment reversal under review…" copy). Maker-checker trail with makerId/checkerId from PaymentEvidence. Actions: Confirm / Reject (PAYMENT_REJECTION_REASONS) / More info / Escalate. Finance-only.

4. **AdminPayouts** — 4 tabs: Batch queue (12.5), Slip detail (12.10), Offline instruments (12.13), Cheque bounce (12.15). beneficiaryToken only — never raw bank details. Maker confirm → Checker authorize (₹25k threshold) → mark processed (attach bank ref) → slip. Slip detail: agreed fee, commission ₹0, statutory withholding if applicable, bank charge if disclosed, net payout — TDS never hardcoded. Offline instrument logger. Cheque bounce with "system tracks workflow; does not provide legal advice" disclaimer.

5. **AdminRefunds** — QueueTable + Sheet detail. Approve (reason modal) → execute manually (transfer-ref dialog) → mark refunded → notify Buyer. Finance-only.

6. **AdminDisputes** — QueueTable with dispute SLA (0–5d normal / 5–7d approaching / 7d+ breached / 14d+ escalation-due). Detail Sheet: deadlock interlock ("Direct dispute chat is paused…"), extortion interlock ("Reviews are paused while this contract is under dispute review"), Buyer claim, Pro counterclaim, immutable contract evidence, payment ledger, admin decision panel. Actions: release full / partial (amount input) / refund Buyer / request evidence / escalate Ops. Risk + Ops only.

7. **AdminTrust** — QueueTable + risk-flag cross-reference section. Detail Sheet: allegation + evidence, action history timeline. Actions: request info / restrict visibility / suspend content / suspend account (12.6 interlock modal with obligation checks) / restore / escalate to counsel. Risk-only.

8. **AdminAudit** — Filterable QueueTable (entity, admin). Masked-reveal events flagged. "Demo masked reveal" button demonstrates reason-gated reveal → addAudit maskedReveal:true. finance/risk/ops only.

9. **AdminGigModeration (v0.2)** — QueueTable of gigs in moderation states. Detail Sheet: gig preview, creator profile, deliverables & exclusions, evidence & content checks, moderation history. Actions: Approve / Request changes (GIG_MODERATION_REASONS) / Reject / Pause / Escalate to Risk. admin_support + ops_manager only.

10. **AdminNotes** — Read-only adminNotes from store + PermissionMatrix + implementation-assumptions panel + 9 v0.1-specific constraint cards.

## Critical-rule compliance
- Permission separation explicit (PermissionDenied for every gated action with allowed-roles list).
- Maker-checker for all money movement (Maker confirms / Checker authorizes / both via addAudit).
- Every admin money action: role, timestamp, prev→next state, reason (addAudit).
- PAN/account/IFSC masked by default; reveal requires role + reason + audit event (maskedReveal:true).
- beneficiaryToken in all general tables — never raw bank details.
- TDS/GST/TCS never hardcoded.
- Modals for money/suspend/deletion/dispute; toasts for low-risk only.
- QueueTable everywhere (responsive table→cards); SLATimer for SLA states.
- Touch targets ≥44px (min-h-[44px] on action buttons); semantic headings (h1/h2).
- No indigo/blue primary brand color (uses default shadcn grayscale primary).

## Validation
- `bun run lint`: clean for AdminScreens.tsx (0 errors, 0 warnings). One pre-existing warning in `visitor/RoleAuthScreens.tsx` (not this task's file).
- `npx tsc --noEmit -p tsconfig.json`: clean for AdminScreens.tsx.
- Dev server: 200 OK on `/`, no compile errors in dev.log.

## Notes for the orchestrator
- The file is ready to be wired into the router (view name → component map).
- View names that should map to these components (per `ViewName` in types.ts):
  - `admin_operations` → `AdminOperations`
  - `admin_kyc` → `AdminKyc`
  - `admin_payments` → `AdminPayments`
  - `admin_payouts` → `AdminPayouts`
  - `admin_refunds` → `AdminRefunds`
  - `admin_disputes` → `AdminDisputes`
  - `admin_trust` → `AdminTrust`
  - `admin_audit` → `AdminAudit`
  - `admin_gig_moderation` → `AdminGigModeration`
  - `admin_notes` → `AdminNotes`
- All components read state and actions exclusively from `useQQ()`.
- The Sheet/Dialog flows mutate store via `updateKyc` / `updatePayment` / `updatePayout` / etc. and call `addAudit` for every state change.
