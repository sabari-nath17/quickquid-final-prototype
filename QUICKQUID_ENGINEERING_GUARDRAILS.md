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
- Seeded prototype Pros intentionally bypass readiness and open as approved demo accounts. New accounts still follow readiness/KYC gating. Do not copy the bypass into production onboarding.

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

interface ExternalProfilePreview {
  provider: ExternalProfileProvider;
  kind?: "identity" | "experience" | "education" | "certification" | "project" | "portfolio";
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  details?: { label: string; value: string }[];
  imageExpiresAt?: string;
  tags?: string[];
  stats?: string[];
  source: "github_api" | "provider_api" | "demo_fixture" | "manual";
  syncedAt?: string;
}
```

- Normalize and allow only `http(s)` URLs; reject phone, messaging, payment, and circumvention links.
- GitHub public repositories may be read through a rate-limited server-side adapter in production. The current prototype uses the public REST endpoint only when a GitHub profile URL is present, displays no private repositories, and shows an empty state on errors.
- LinkedIn is a link until OAuth is implemented. The production adapter must request the smallest permitted scopes, store tokens encrypted, support disconnect/revoke, cache only permitted fields, and show the sync timestamp.
- The public profile may render provider previews from `ExternalProfilePreview`. GitHub profile/repository data can be read from the public API; LinkedIn/Behance previews in this prototype are fixtures because their production APIs require OAuth/API credentials. Never infer ownership from a URL alone.
- `kind` is a display classification, not a verification category. `certification` cards are self-declared or provider-returned records; Admin must separately review evidence and issuer validity. `experience` and `education` cards are optional and must degrade gracefully when a provider does not return them.
- Do not invent project counts, ratings, clients, employers, repository ownership, or “verified” claims from a URL alone. A provider connection proves only that the provider returned the data; Admin verification remains a separate decision.

### Provider capability matrix (researched August 2026)

| Source | Safe data QuickQuid can display | What production needs | Prototype behavior |
| --- | --- | --- | --- |
| GitHub public REST | Public avatar, display name/login, bio, profile URL, public-repository count, followers, repository name/description, primary language, stars, forks, topics, and `pushed_at` | Rate-limited server adapter, cache, consented connection when associating data with an applicant, and a refresh/disconnect audit | Fetches the public profile and up to four recently updated public repositories in the browser; never requests private repositories. |
| GitHub contribution calendar | Contribution calendar and contribution totals | Authenticated GraphQL connection; the calendar is not available from the small public REST sync | Renders a clearly labelled **Demo calendar** for every seeded Pro only. It never claims a real contribution total. Production replaces the fixture with authenticated GraphQL data or hides the calendar. |
| LinkedIn | With Sign In with LinkedIn/OpenID Connect, the consenting member’s identity fields, headline, and profile-picture URL; some approved LinkedIn products can expose additional current-position/education fields | LinkedIn app approval, 3-legged OAuth, least-privilege scopes, encrypted token vault, consent/revocation, retention policy, and server-side sync | Shows complete provider-shaped identity, experience, education, certificate, and project fixtures. A pasted LinkedIn URL is never treated as a fetched profile. |
| LinkedIn experience/certifications | Not generally available for arbitrary public profiles. Profile/Certification APIs are restricted to approved developers/products and the authenticated member’s permissions | Explicit product approval and member consent; store only permitted fields and show source/timestamp | Keep as self-declared/manual fields until an approved adapter exists; never scrape LinkedIn HTML. |
| Behance | Provider project/profile metadata and preview media when the user authorizes an Adobe/Behance integration | Adobe Developer credentials/API access, OAuth where user-owned data is read, token handling, rate limits, and media/copyright review | Shows provider-shaped demo previews only; no anonymous browser scrape. |
| Portfolio website | Self-declared link; production may extract limited Open Graph title/image/description through a server fetch | SSRF protection, allow-listing, timeouts, content-type/size limits, malware/media checks, copyright and cache policy | Renders supplied portfolio items and safe preview fixtures; does not scrape arbitrary pages in the browser. |

Provider-sourced media must carry its source and `syncedAt` timestamp. A profile picture is an identity-display asset, not proof of identity, employment, skill, or ownership. LinkedIn image URLs can expire; production must retain `imageExpiresAt`, refresh safely, and show an avatar fallback. Preview cards must preserve the provider link and provide a truthful empty/error state when a provider rate-limits, revokes consent, or returns incomplete data.

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
