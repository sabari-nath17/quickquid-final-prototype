# QuickQuid engineering source of truth

This document is the handoff contract for the production team and for any AI assistant that refers to this prototype. It describes the behavior that must remain true while replacing the local Zustand demo state with authenticated services.

## Product position

QuickQuid is an execution marketplace:

> Most marketplaces help you hire. QuickQuid helps the work get finished.

Do not replace this with “Bring the brief. Leave with finished work.” The product promise is preparation, proof-matching, an explicit Pact, controlled delivery, and acceptance in one accountable record.

## Current prototype boundaries

- Frontend-only, local Zustand state; no production identity, payment, storage, or OAuth service is connected.
- GitHub Pages is a static export. Public GitHub repository previews use the unauthenticated public GitHub REST endpoint from the browser and fail closed when unavailable.
- LinkedIn, Behance, Dribbble, and portfolio websites are captured as safe public links only. LinkedIn OAuth/API requires a server-side integration, explicit consent, encrypted token storage, token revocation, and provider policy review. Never ask a user for a LinkedIn password.
- KYC documents and payout values are represented by local filenames/masked values. Production must use a compliant KYC vendor, encrypted object storage, retention rules, access logs, and server-side authorization.
- Payment and payout states are demonstrations. Never interpret a local “confirmed” state as a bank settlement without a provider webhook and maker-checker authorization.
- Seeded Pro proof links and Sara’s portfolio fixtures are explicitly marked `isDemo: true`. They exist to exercise the provider/API and Admin review UI only; they are not applicant ownership, employment, ratings, or verification evidence. Production data must replace them with consented, applicant-owned connections.

## Pro onboarding contract

Every new Pro follows this order:

1. Create an account and select the `Pro` role.
2. Complete the profile: display name, headline/bio, one primary category, skills, availability, and at least one public proof link (GitHub, LinkedIn, Behance, Dribbble, website, or other approved HTTPS source).
3. Submit one evidence item for every selected skill. Evidence is stored as a per-skill record, never as one unlabeled blob.
4. Submit identity document, PAN, payout details, category, skills, public proof links, and portfolio IDs together. The KYC record contains an immutable `profileSnapshot` for the Admin review.
5. Admin Support/Ops reviews identity and profile completeness. Each skill is approved or rejected independently. Finance/Ops reviews payout evidence according to the permission matrix.
6. Only after identity and at least one skill are approved does the account receive `QuickQuid Verified`. The badge title and accessible label must remain exactly `QuickQuid Verified`.
7. Paid-work actions and gig publishing stay gated until onboarding and payout readiness are approved. A rejected or re-requested review returns the Pro to the relevant step without deleting their draft.

The Admin queue must show, at minimum: applicant, role, primary category, selected skills, per-skill evidence/status, identity document status, payout fields masked, public proof links, portfolio IDs, risk signals, timestamps, SLA, and audit history.

## Public proof links and API adapters

`ExternalProfileLink` is public proof, not KYC evidence. The current adapter contract is:

```ts
type ExternalProfileProvider = "github" | "linkedin" | "behance" | "dribbble" | "website" | "other";
interface ExternalProfileLink {
  provider: ExternalProfileProvider;
  url: string;
  status?: "self_declared" | "connected" | "reviewed";
  isDemo?: boolean; // seed-only fixture; never a trust signal
  lastSyncedAt?: string;
}
```

- Normalize and allow only `http(s)` URLs; reject phone, messaging, payment, and circumvention links.
- GitHub public repositories may be read through a rate-limited server-side adapter in production. The current prototype uses the public REST endpoint only when a GitHub profile URL is present, displays no private repositories, and shows an empty state on errors.
- LinkedIn is a link until OAuth is implemented. The production adapter must request the smallest permitted scopes, store tokens encrypted, support disconnect/revoke, cache only permitted fields, and show the sync timestamp.
- Do not invent project counts, ratings, clients, employers, repository ownership, or “verified” claims from a URL alone. A provider connection proves only that the provider returned the data; Admin verification remains a separate decision.

## Gig lifecycle and priority placement

### Gig states

`draft → submitted → under_review → approved_live → paused → archived`

Moderation can branch to `changes_requested` or `rejected`; a Pro edits and resubmits. Existing contracts retain their original terms when a gig is edited, paused, or archived.

Submission validation must include title, short description, category, at least one included item, positive Pro fee, deliverable format, timeline, buyer requirements, evidence, and a verified Pro onboarding state. Saving a draft is allowed before approval; publishing is not.

### Priority boost states

`payment_evidence_submitted → under_admin_verification → payment_confirmed → active → expired`

Rejected evidence goes to `rejected` and may be resubmitted. A Pro may have only one open or active boost per gig. A boost is available only for an `approved_live` gig owned by a Pro with approved onboarding and payout readiness. The fee is a separate marketing fee, not commission and not a guarantee of a buyer request.

Finance or Ops verifies the payment reference. Activation records maker, checker/authorization, timestamps, fee, duration, gig ID, and an audit event. A scheduled worker/webhook must expire the placement at `priorityEnd`; the UI expiry check is only a demo fallback.

## Automation and AI guard rails

Automation may:

- normalize public URLs;
- fetch public GitHub metadata within rate limits;
- calculate readiness/checklist progress;
- route complete submissions to the correct Admin queue;
- calculate fees, SLA labels, and priority expiry;
- detect possible phone/email/payment-link circumvention as a non-decisive signal;
- generate a draft summary for an Admin.

Automation or an AI assistant must never:

- approve/reject identity, KYC, a skill, a gig, a dispute, or a payment without the authorized human decision;
- infer identity, employment, skill level, income, or ownership from a profile URL;
- expose PAN, bank account, IFSC, documents, OAuth tokens, or private repository data;
- contact a Buyer/Pro or change a contract, scope, price, payout, or legal status without an explicit user/admin action;
- bypass maker-checker, retention, consent, audit, or role permissions;
- turn a risk signal into an account decision;
- claim a live job, testimonial, rating, deadline, counter, or provider verification that the system cannot prove.

Every automated recommendation must carry its source, timestamp, confidence/limitations, and a human review action. Store the final decision and reason as an immutable audit event.

## Required production services before launch

1. Auth/session service with role and organization authorization enforced server-side.
2. KYC/identity provider plus encrypted document storage and deletion/export workflows.
3. GitHub/LinkedIn/provider adapters with OAuth consent, token vault, rate limits, retries, disconnect, and webhook/sync audit.
4. Payment provider webhooks and payout maker-checker service; never trust browser state.
5. Moderation/risk queues with SLA timers, assignment, escalation, and immutable audit logs.
6. Media scanning/storage with malware, content, copyright, retention, and access controls.
7. Observability for failed syncs, queue latency, verification decisions, payment mismatches, and unauthorized attempts.

## Engineer verification checklist

- Verify a new Pro cannot publish a gig, submit a proposal, or buy priority placement before Admin approval.
- Verify every selected skill has its own evidence and review status.
- Verify Admin can see the submitted category, links, portfolio IDs, identity status, payout masks, risk signals, and audit history in one review surface.
- Verify approval of identity plus one skill produces the exact QuickQuid Verified badge; rejection never produces it.
- Verify public profiles display only public links and provider-returned public metadata.
- Verify a failed/limited provider API leaves a truthful empty state and never blocks unrelated profile editing.
- Verify priority boosts have one open request per gig, permission-gated approval, a complete audit trail, and automatic expiry.
- Verify all sensitive fields are masked by default and every reveal is reasoned and audited.
- Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, static export, responsive browser smoke tests, and an end-to-end seeded review of Buyer, Pro, and Admin routes.
