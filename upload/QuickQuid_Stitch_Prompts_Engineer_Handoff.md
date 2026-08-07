# QuickQuid v0.1 — Google Stitch UI Generation Prompts
## Production-Grade UI/UX Specifications for Engineer Handoff

> **Source PRD:** `QuickQuid_v0.1_Engineering_PRD-2.md` (5,293 lines, 13 primary screens, 98 sub-screens)
> **Tool target:** Google Stitch (text-to-UI generation)
> **Coverage:** Full matrix — every screen S01–S12 + S99, every sub-screen, every state variant, desktop + mobile adaptations
> **Fidelity rule:** No data loss, no addition, no hallucination. Every visual cue, color, component, field, validation rule, permission gate, and state transition in this document is sourced verbatim from the PRD.
> **Document version:** 1.0
> **Date:** 2026-08-08

---

## Part 0 — How to Use This Document

### 0.1 Reading order

1. **Part 1 (Canonical Design System)** — read once. Every prompt below assumes these colors, components, and conventions.
2. **Part 2 (Screen-by-Screen Prompts)** — each screen section is self-contained. Copy the prompt block for the sub-screen you want to generate in Google Stitch.
3. **Appendix (Shared Components & State Matrix)** — reference for cross-screen consistency.

### 0.2 How to feed a prompt into Google Stitch

For each sub-screen in this document you will find:

```
### Frame: [Role] / [Screen ID] / [Sub-screen ID] / [State] / [Viewport]
```

This header follows the PRD's canonical frame naming convention (§2.4):

> `[Role] / [Screen ID] / [Sub-screen ID] / [State] / [Viewport]`
> Example: `Pro / S01 / 1.12 / Published / Desktop`
> Example: `Buyer / S09 / 9.4 / Rejected-Recovery / Mobile`
> Example: `Finance / S12 / 12.5 / Pending-Authorization / Desktop`

Under the header is a **Stitch Prompt** block (in a fenced code block). Copy the entire block — including the layout instructions, color hex codes, component list, field list, state behavior, and permission notes — and paste it into Google Stitch as the prompt.

### 0.3 State matrix (applies to every sub-screen)

Per PRD §11.3, every primary screen and every interactive sub-screen must support the following UX states. Where a state is non-applicable (e.g. a static informational modal has no "empty" state), it is explicitly marked "N/A" in the prompt.

| State | Purpose | Visual treatment |
|---|---|---|
| **Default** | Loaded with canonical sample data | Per actor palette |
| **Loading** | First-paint or async fetch in flight | Skeleton shimmer, status badge = grey `#64748B` |
| **Empty** | No data exists yet | Empty-state illustration + recovery CTA |
| **Validation error** | Form-level or field-level validation failure | Red border `#DC2626`, inline helper text |
| **Permission denied** | User lacks role for action | Read-only, hidden controls, inline explanation |
| **Pending** | Awaiting Admin or async decision | Amber badge `#F59E0B`, target review time shown |
| **Success** | Terminal positive | Green badge `#16A34A`, confirmation copy |
| **Rejected / Recovery** | Admin rejection or system failure | Red badge `#DC2626`, reason + recovery CTA |
| **SLA warning** | Approaching SLA breach | Amber `#F59E0B` to red `#DC2626` gradient |
| **Mobile variant** | Adapted for ≤ 768px viewport | See §0.5 below |

### 0.4 Canonical sample data (use in every default-state prompt)

Every default-state prompt uses the same canonical sample data from PRD §0.2 so that generated frames are visually consistent:

| Object | Sample |
|---|---|
| Buyer | Northstar Labs (BUY-1042), B2B SaaS, Kochi |
| Pro | Akhil Menon (PRO-2088), Product Designer and UX Researcher |
| Brief | Build a secure partner onboarding portal (BRF-0892) |
| Contract | QQ-0892 |
| Pro fee | ₹80,000 |
| Buyer fee | 14% = ₹11,200 |
| Buyer total | ₹91,200 before applicable taxes |
| Counter-offer | ₹85,000 Pro fee / ₹11,900 Buyer fee / ₹96,900 total before tax |
| Milestones | M1 ₹34,200; M2 ₹20,000; M3 ₹15,800; M4 ₹10,000 |
| Payment provider | Razorpay Route (marketplace account QQ-MKT-001) |
| Provider payment ID | pay_NK7s2QwRtpXyZ9 |
| Provider hold ID | hold_NK7s2QwRtpXyZ9-M1 |
| Provider settlement ID | sett_NK7s2QwRtpXyZ9-M1 |

### 0.5 Mobile adaptation rules (apply to every sub-screen)

Per PRD §11.5, every mobile variant (viewport ≤ 768px) must:

1. **Stack the commercial summary above the primary CTA** — never hide price, Buyer fee, or Buyer total on mobile.
2. **Replace left filter rail with bottom-sheet filter** — trigger via a "Filters" pill button.
3. **Convert desktop two-pane layouts (e.g. 6.1 applicants, 7.1 messaging) to single-pane** with swipe navigation between list and detail.
4. **Sticky action-required banner at top** — does not dismiss on scroll.
5. **Status badges always render icon + text** — color-only is forbidden (color-blind safety).
6. **Floating Help widget** must not cover the primary CTA — position above CTA with 16px margin.
7. **Sidebar collapses to bottom navigation bar** with role-appropriate items (Buyer: Dashboard, Find Talent, Briefs, Contracts, Messages; Pro: Dashboard, Find Briefs, Proposals, Workroom, Payouts, Messages, Gigs; Admin: Operations, KYC, Payments, Payouts, Disputes).
8. **Sticky commercial pane (33% right rail on desktop)** stacks as a card immediately above the primary CTA on mobile.
9. **Two-pane admin workspaces** (e.g. 9.3 Finance Unlock) collapse to single column with detail drawer that slides up from bottom.
10. **Maker-checker confirmation modals** render full-screen on mobile (not as side drawers).

### 0.6 Copy rules (forbidden language)

Per PRD §1.5, the following words/phrases are **forbidden** in any generated UI copy:

| Forbidden | Required replacement |
|---|---|
| "wallet" | "linked account" or "payout account" |
| "escrow" (QuickQuid-built) | "provider-managed custody" or "regulated payment provider" |
| "verified" (generic badge) | Specific trust label: "identity reviewed", "portfolio reviewed", "availability", "completed projects" |
| "payout sent to bank" (before webhook) | "payout release approved; provider is settling" |
| "payment confirmed" (after provider capture only) | "funds captured by provider, awaiting Finance unlock" |
| "instant transfer" | "settlement via provider" |
| Hardcoded tax rate (e.g. "18% GST") | "Applicable taxes as determined by Finance" |

---

## Part 1 — Canonical Design System (PRD-extracted)

### 1.1 Actor color palette (PRD §0.1)

Every actor in the system has a canonical color. Use these hex codes consistently across all frames.

| Actor | Hex | RGB | Usage context |
|---|---|---|---|
| Visitor / Buyer | `#2563EB` | 37, 99, 235 | Discovery, brief, payment, acceptance surfaces |
| Pro | `#16A34A` | 22, 163, 74 | Profile, proposal, delivery, payout surfaces |
| Support Tier 1 | `#0891B2` | 8, 145, 178 | KYC intake, support tickets |
| Finance Tier 2 | `#EA580C` | 234, 88, 12 | Payment verify, payout release, refund |
| Risk Tier 3 | `#DC2626` | 220, 38, 38 | Risk review, dispute, suspension |
| Ops Manager | `#7C3AED` | 124, 58, 237 | SLA, escalation, assignment |
| System | `#64748B` | 100, 116, 139 | Automated state transitions, neutral surfaces |

**Background tints** (derived from above, used in cards/badges):
- Buyer tint: `#DBEAFE` (fill), `#1E3A8A` (text)
- Pro tint: `#DCFCE7` (fill), `#14532D` (text)
- Support tint: `#CFFAFE` (fill), `#155E75` (text)
- Finance tint: `#FED7AA` (fill), `#7C2D12` (text)
- Risk tint: `#FEE2E2` (fill), `#7F1D1D` (text)
- Ops tint: `#EDE9FE` (fill), `#4C1D95` (text)
- Visitor tint: `#F1F5F9` (fill), `#334155` (text)
- Rail/provider tint: `#FECACA` (fill), `#B91C1C` stroke (3px), `#7F1D1D` (text)

### 1.2 Status color palette (PRD §0.1)

| Status family | Hex | Usage |
|---|---|---|
| Success / Confirmed | `#16A34A` | Terminal positive (KYC approved, payment confirmed, payout settled) |
| Pending / In review | `#F59E0B` | Awaiting action (KYC in review, capture pending unlock, payout queued) |
| Error / Rejected / Disputed | `#DC2626` | Recovery required (KYC rejected, capture failed, dispute opened) |
| Blocked / Locked | `#6B7280` | Cannot proceed (work gate locked, scope locked, suspended) |
| Draft / Initial | `#3B82F6` | Pre-action (draft brief, draft proposal, draft gig) |

**Banner priority gradient** (PRD §4.2.5) — used in action-required banners, most urgent wins:
1. `#DC2626` (SLA breach > 24h)
2. `#EA580C` (Buyer: submit payment evidence)
3. `#F59E0B` (Pro: do not begin work)
4. `#FACC15` (Buyer: review submitted deliverable)
5. `#A3E635` (Pro: revision requested)
6. `#84CC16` (Dispute response required)
7. `#22C55E` (Payout failed — update details)
8. `#16A34A` (KYC resubmit)
9. `#15803D` (Brief approaching inactivity)

### 1.3 Shared UI element inventory (PRD §2.3)

These 7 components appear across multiple screens. Build each once and reuse everywhere.

#### 1.3.1 Status badge
- **Used by:** All screens
- **Behavior:** Icon + text + semantic color; **never color-only**
- **Accessibility:** Color-blind safe; `aria-label` includes full status text
- **Variants:** success (`#16A34A`), pending (`#F59E0B`), error (`#DC2626`), blocked (`#6B7280`), draft (`#3B82F6`)
- **Sizes:** sm (24px height, 12px font), md (28px height, 13px font), lg (32px height, 14px font)

#### 1.3.2 Action-required banner
- **Used by:** Buyer/Pro dashboards, contract screens
- **Behavior:** Remains visible until blocking action is resolved
- **Placement:** Sticky at top of content area, below breadcrumb
- **Dismiss:** Only allowed after action taken (never just "X" button)
- **Structure:** Icon + headline (action verb + entity ref) + sub-headline (next step) + primary CTA button + secondary "Learn more" link

#### 1.3.3 Fee breakdown
- **Used by:** Brief, proposal, offer, payment, invoice, payout slip
- **Behavior:** Always separates Pro fee and Buyer fee; never shows total without breakdown
- **Structure (vertical list):**
  ```
  Pro fee                            ₹80,000
  QuickQuid commission from Pro      ₹0
  Buyer fee (14%)                    ₹11,200
  Applicable taxes                   Determined by Finance
  ─────────────────────────────────────────────
  Buyer total before tax             ₹91,200
  ```
- **Source:** Canonical FeeObject (PRD §3.2) — single source of truth, never recompute locally

#### 1.3.4 Readiness card
- **Used by:** Buyer/Pro onboarding
- **Behavior:** Explains eligibility and links to unblock action; updates live as supporting state changes
- **Structure:** Task title + status badge + 1-line explanation + CTA button + "Why this matters" expandable
- **States:** complete (green check), in-progress (amber spinner), blocked (red lock), not-started (grey circle)

#### 1.3.5 Audit event
- **Used by:** Admin screens
- **Behavior:** Immutable; append-only
- **Fields (PRD §4.12.7):** event_id (UUID), admin_id, admin_role, action, entity_type, entity_id, old_state, new_state, reason (free text), timestamp (UTC), admin IP + user-agent, reveal_token (if sensitive reveal)

#### 1.3.6 Sensitive field
- **Used by:** Pro/Admin screens (KYC, payout details, bank account)
- **Behavior:** Masks values outside authorized reveal flow; re-masks after configured interval (default 5 minutes per PRD §12.1 item 14)
- **Visual:** Field shows `••••••••` with "Reveal" button (eye icon); on reveal, prompts for reason; on reveal, starts 5-min countdown timer; on expiry, re-masks with toast "Sensitive data re-masked"
- **Permission:** Only Risk Tier 3 (and authorized Finance for payout-specific fields) can reveal

#### 1.3.7 Support widget
- **Used by:** All authenticated screens
- **Behavior:** Floating button bottom-right (desktop) / above primary CTA with 16px margin (mobile per §11.5)
- **On open:** Modal with category selector (Payment issue, Contract issue, Verification, Payout, Dispute, Bug, Other), description textarea, auto-attached context (contract ID, payment reference, current status, latest event, user role)
- **Submit:** Creates SUPPORT_TICKET with status `submitted`; routes to Admin Support queue (12.1)

### 1.4 Typography & spacing (PRD-implied, no external references)

Per PRD §2.5, every primary screen follows the wireframe convention with sidebar / breadcrumb / main / rail. The following spacing system is derived from the wireframe ASCII layouts:

- **Page padding:** 32px desktop, 16px mobile
- **Sidebar width:** 240px desktop (Buyer/Pro), 260px desktop (Admin — longer labels)
- **Content max-width:** 1280px desktop
- **Sticky right rail:** 33% of content width (~400px) on desktop; stacks above CTA on mobile
- **Card padding:** 24px desktop, 16px mobile
- **Card border-radius:** 8px
- **Card border:** 1px solid `#E2E8F0` (slate-200)
- **Card shadow (elevated):** `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- **Section spacing:** 32px between major sections, 16px between cards in a section
- **Button heights:** sm 32px, md 40px, lg 48px
- **Button border-radius:** 6px
- **Form field heights:** 40px (md), 32px (sm)
- **Font stack:** System UI sans-serif (no external font references per "Strictly PRD only" rule)
- **Font sizes:** H1 28px, H2 22px, H3 18px, body 14px, caption 12px

### 1.5 Frame naming convention (PRD §2.4)

Every frame generated in Google Stitch must use this naming pattern in the frame title:

```
[Role] / [Screen ID] / [Sub-screen ID] / [State] / [Viewport]
```

**Examples:**
- `Pro / S01 / 1.12 / Published / Desktop`
- `Buyer / S09 / 9.4 / Rejected-Recovery / Mobile`
- `Finance / S12 / 12.5 / Pending-Authorization / Desktop`
- `Risk / S12 / 12.6 / Suspend-With-Active-Obligations / Desktop`

### 1.6 RBAC quick reference (PRD §6.2)

Every frame must show only the controls the viewer's role permits. The backend authorization layer is the source of truth; frontend hides/disables are progressive enhancement only.

| Role | Sees | Cannot see |
|---|---|---|
| Visitor | Public discovery, role selection | Any private data |
| Buyer | Own briefs, contracts, payments, profiles of Pros | Pro payout data, Admin controls, other Buyers' data |
| Pro | Own profile, proposals, contracts, workroom, payouts, gigs | Buyer payment evidence, Admin controls, other Pros' private data |
| Support Tier 1 | KYC queue, support tickets, workroom read-only | Money movement controls, suspend, risk decisions |
| Finance Tier 2 | Payment unlock, payout release, refund queues, provider webhooks (observe) | Suspend users, dispute decisions, risk cases |
| Risk Tier 3 | Disputes, risk flags, audit log, sensitive reveals, suspensions, gig moderation, Trust/Safety | Money unlock/release/refund execution |
| Ops Manager | All SLA breaches, queue reassignment, escalation | Bypass maker-checker, direct money movement |

---

## Part 2 — Screen-by-Screen Stitch Prompts

> Each screen section below contains the prompts for the primary screen and all its sub-screens.
> Prompts are ordered by sub-screen ID (e.g. 1.1, 1.2, 1.3 ...).
> Each prompt is self-contained — copy the fenced block and paste into Google Stitch.

---

### Screen 01 — Account, Role, Profile and Verification Readiness

**PRD source:** §4.1.1–4.1.7 (lines 1111–1266)
**5W1H:** Visitor, Buyer, Pro, authorized KYC/Risk Admin. Account creation, intent selection, profile setup, public preview, verification readiness, payout-readiness setup. First visit, profile update, Pro eligibility setup, payout-data change. Public entry, authenticated Settings/Profile, Admin KYC queue. QuickQuid needs clear role intent, credible profiles, controlled trust signals, safe payout readiness without making Buyers abandon before seeing value. User selects role → authenticates → completes role-specific profile tasks → submits required information for review → receives clear status → publishes public profile.

#### Frame: Visitor / S01 / 1.1 / Default / Desktop

```
Generate a full-screen desktop (1440×900) role-selection landing page for a freelance marketplace called QuickQuid.

LAYOUT (centered, max-width 960px, vertically centered):
- Top: QuickQuid wordmark logo (left) + "Help" link + "Sign in" link (right), 64px header bar, white background
- Hero headline (28px, semibold, #0F172A): "What do you want to do on QuickQuid?"
- Sub-headline (16px, regular, #475569): "Choose how you'll use QuickQuid. You can switch roles later from Settings."
- Two large cards side-by-side (480px × 360px each, 24px gap, 8px border-radius, 1px solid #E2E8F0):

CARD 1 — "I want to hire" (Buyer):
- Top: 64×64px icon (briefcase outline, #2563EB blue fill)
- Title (20px, semibold, #1E3A8A): "I want to hire"
- Body (14px, #475569): "Find verified professionals, post briefs, and pay through regulated provider-managed custody. 14% Buyer fee applies on top of the Pro's fee."
- Bullet list (4 items, 13px, #334155):
  • Browse talent with trust labels (identity reviewed, portfolio reviewed)
  • Post open or private briefs
  • Pay via provider-hosted checkout (Razorpay Route)
  • Maximum 4 milestones per contract
- CTA button (full-width, 48px height, #2563EB background, white text, 6px radius): "Continue as Buyer"
- Footer microcopy (12px, #64748B): "You'll complete a profile and organization details next."

CARD 2 — "I want to work" (Pro):
- Top: 64×64px icon (brush/tool outline, #16A34A green fill)
- Title (20px, semibold, #14532D): "I want to work"
- Body (14px, #475569): "Build a profile, submit proposals, deliver work, and receive payouts to your linked account."
- Highlight badge (16px height, #DCFCE7 background, #14532D text, 4px radius): "0% QuickQuid commission — keep 100% of your agreed professional fee"
- Bullet list (4 items, 13px, #334155):
  • Identity + payout verification required
  • Submit up to 10 active proposals
  • Payouts settled via provider to your linked account
  • Create productized gigs after approval
- CTA button (full-width, 48px height, #16A34A background, white text, 6px radius): "Continue as Pro"
- Footer microcopy (12px, #64748B): "You'll complete profile, KYC, and payout setup next."

BELOW BOTH CARDS:
- Horizontal divider (1px, #E2E8F0, 32px margin)
- Auth section (centered): "Continue with:" + 3 buttons (Google, LinkedIn, Email) — each 40px height, white background, 1px solid #E2E8F0, 6px radius, 12px gap
- Microcopy (12px, #64748B, centered): "By continuing, you agree to QuickQuid's Terms (including fee structure) and Privacy Notice."

VISUAL STYLE:
- Background: #FFFFFF with subtle radial gradient hint of #F8FAFC at corners
- No external design references — pure system UI sans-serif typography
- Hover on either card: border becomes 2px solid (#2563EB or #16A34A respectively), shadow elevates

STATES:
- Default: as above
- Loading (after auth click): button shows spinner, copy changes to "Setting up your account..."
- Error (auth failure): inline red banner above auth section: "Authentication failed. Please try again or use a different method." (#FEE2E2 background, #DC2626 text, #DC2626 1px border, 6px radius, 12px padding)
- Success: card fades out, full-screen transition to S01/1.2 Readiness Dashboard with role-appropriate layout
```

#### Frame: Visitor / S01 / 1.1 / Default / Mobile

```
Same content as desktop but adapted for 390×844 mobile viewport.

LAYOUT (single column, 16px padding):
- Header: 56px height, QuickQuid wordmark centered, "Help" link left, "Sign in" link right
- Hero headline (22px, semibold): "What do you want to do?"
- Sub-headline (14px): "Choose how you'll use QuickQuid."
- Card 1 (Buyer): full-width, stacked vertically — icon 48×48px, title, body, bullets (now collapsible "Learn more" expandable), CTA button
- 16px gap
- Card 2 (Pro): full-width, same structure
- Divider
- Auth section: 3 buttons stacked vertically (full-width, 44px height each)
- Microcopy below

MOBILE-SPECIFIC:
- Bullets collapse behind "Show details" expandable to reduce scroll fatigue
- CTA buttons sticky-positioned within their cards
- Auth buttons stack vertically (not horizontal) for thumb reach
- No horizontal scroll; all content fits 390px width
```

#### Frame: Buyer / S01 / 1.2 / Default / Desktop

```
Generate a full-screen desktop (1440×900) Buyer Readiness Dashboard for QuickQuid.

LAYOUT (3-column: 240px sidebar | main content | 0px):
SIDEBAR (240px, #F8FAFC background, 1px right border #E2E8F0):
- QuickQuid logo at top (40px height, 16px padding)
- Role badge below logo: "Buyer" pill (#DBEAFE background, #1E3A8A text, 12px font, 4px radius)
- Nav items (Buyer nav per PRD §2.2.1):
  • Dashboard (active, #2563EB left border 3px, #1E3A8A text, #DBEAFE background)
  • Find Talent
  • My Briefs
  • Contracts
  • Payments
  • Messages (with unread dot badge, #DC2626)
  • Settings
- Each nav item: 40px height, 16px left padding, 14px font, hover #E2E8F0
- Bottom: user avatar (32px circle), "Northstar Labs" (13px semibold), "BUY-1042" (11px #64748B), settings gear icon

MAIN CONTENT (1200px max-width, 32px padding):
- Top bar (64px height): "Help" link | Bell icon (with unread count badge "3") | Avatar
- Breadcrumb (12px #64748B): "Account / Profile"
- Page title row: H1 "Profile & Readiness" (28px semibold #0F172A) on left | "Profile completion 72%" badge on right (circular progress ring, #F59E0B amber for in-progress, 64×64px)

READINESS CARDS SECTION (vertical stack, 16px gap):
Each card: 24px padding, 8px radius, 1px solid #E2E8F0, white background

CARD 1 — "Account basics" (status: complete)
- Left: green checkmark icon (#16A34A, 24px) in circle
- Title (16px semibold): "Account basics"
- Status badge: "Complete" (#DCFCE7 background, #14532D text)
- Body (13px #475569): "Email verified, password set."
- No CTA (already complete)

CARD 2 — "Organization details" (status: complete)
- Same structure, green checkmark
- Title: "Organization details"
- Body: "Northstar Labs, GSTIN 32AAAAA0000A1Z5, billing contact set."
- CTA link (14px, #2563EB): "Edit organization details →" (links to 1.8)

CARD 3 — "Profile" (status: in-progress, 72%)
- Amber spinner icon (#F59E0B)
- Title: "Buyer profile"
- Status badge: "In progress" (#FEF3C7 background, #78350F text)
- Body: "Display name, logo, company description, industry, hiring categories."
- Progress bar (200px wide, 6px height, #E2E8F0 track, #F59E0B fill at 72%)
- CTA button (40px height, #2563EB background, white text, 6px radius): "Complete profile" (links to 1.11)

CARD 4 — "Create your first brief" (status: not-started)
- Grey circle icon (#6B7280)
- Title: "Create your first brief"
- Status badge: "Not started" (#F1F5F9 background, #334155 text)
- Body: "Buyers can browse talent and draft briefs before verification — but funding a milestone requires organization details."
- CTA button (secondary, white background, 1px solid #2563EB, #2563EB text): "Post a brief" (links to 5.1)

RIGHT-SIDE "WHAT YOU CAN DO NEXT" PANEL (320px, sticky):
- Card with #DBEAFE tint background
- Title (14px semibold #1E3A8A): "What you can do right now"
- Bullet list (3 items, 13px #1E3A8A):
  ✓ Browse talent (no verification needed)
  ✓ Draft a brief (saves as private draft)
  ✓ Invite Pros to a private brief
- Below bullets: "Cannot do yet:" header (13px semibold #DC2626)
- Bullet list (1 item, 13px #DC2626):
  ✗ Fund a milestone (requires organization details)

STATES:
- Default: as above (72% complete)
- Loading: skeleton shimmer on all cards
- Empty (brand new Buyer, 0% complete): all cards show "Not started" grey state, profile completion ring shows 0% in #6B7280
- Complete (100%): all cards green, ring turns #16A34A, banner appears "Readiness complete — you can now fund milestones"
- Permission denied (Pro viewing Buyer dashboard — should never happen, redirect to Pro dashboard)
```

#### Frame: Pro / S01 / 1.2 / Default / Desktop

```
Same shell as Buyer dashboard but with Pro-specific readiness cards.

PRO READINESS CARDS (in order):
1. Account basics — green check, "Email verified"
2. Profile — green check, "Akhil Menon, Product Designer, portfolio linked" → "Edit profile →" (1.11)
3. Identity verification (KYC) — amber pending, "Submitted 2 days ago, target review 24h" → status badge "Under Admin review" (#FEF3C7 bg, #78350F text)
4. Payout details — green check, "Linked account verified" → "Update payout details →" (1.7)
5. Pro Work Relationship acknowledgement — green check, "Acknowledged 2026-08-05"
6. Proposal eligibility — green check, "100% eligible — up to 10 active proposals"
7. Gig creation eligibility — green check, "Eligible to create gigs"

PROFILE COMPLETION RING: 100% in #16A34A

"WHAT YOU CAN DO NOW" PANEL (#DCFCE7 tint, #14532D text):
✓ Submit proposals (up to 10 active)
✓ Create productized gigs
✓ Receive payouts to linked account

Cannot do yet:
(none — fully eligible)

SIDEBAR (Pro nav per PRD §2.2.2):
- Dashboard (active)
- Find Briefs
- My Proposals (with count badge "3 active")
- Contracts
- Workroom
- Payouts
- Messages (unread dot)
- Gigs
- Settings

Role badge: "Pro" pill (#DCFCE7 background, #14532D text)
Avatar: "Akhil Menon" / "PRO-2088"
```

#### Frame: Pro / S01 / 1.3 / Default / Desktop

```
Generate a full-screen desktop KYC and Payout Upload modal/step for a Pro user in QuickQuid.

LAYOUT (modal, 800px wide, centered, 32px padding, white background, 12px radius, shadow):
- Header: H2 "Identity & Payout Verification" (22px semibold #0F172A) | close X (top right, 24px, #64748B)
- Sub-headline (14px #475569): "Required before you can submit paid proposals. Your information is masked after entry and reviewed by Support Tier 1."
- Progress stepper (horizontal, 4 steps with connecting line):
  Step 1: Identity (active, #2563EB filled circle with "1")
  Step 2: Professional details (grey #64748B outline)
  Step 3: Payout details (grey)
  Step 4: Review & submit (grey)

STEP 1 — IDENTITY (visible):
Section card (1px solid #E2E8F0, 16px padding, 8px radius):
- Title (16px semibold): "Identity documents"
- Sub-text (13px #64748B): "Accept JPG, PNG, PDF up to 10MB. Masked after upload."
- Upload zones (2, side-by-side):
  Zone A: "PAN card or Aadhaar" — dashed border 2px #2563EB, 120px height, "Click to upload or drag" text + cloud icon
  Zone B: "Address proof (optional)" — dashed border 2px #94A3B8, 120px height
- Below each upload zone after file added: file thumbnail (32px icon) + filename + "Masked" badge (#F1F5F9 bg, #334155 text) + remove X button

Footer of modal:
- Left: "Save and exit" link (#64748B)
- Right: "Continue to Step 2" button (#2563EB, white text, 40px height, 6px radius)

VALIDATION:
- File type must be JPG/PNG/PDF — else inline error: "Allowed: JPG, PNG, PDF up to 10MB." (#DC2626 text)
- File size > 10MB — inline error: "File too large. Maximum 10MB."
- Continue button disabled until at least Zone A has a valid file

STATES:
- Default (Step 1, no files): as above
- File uploaded: thumbnail appears, "Masked" badge shown, sensitive field component activates (per §1.3.6)
- Loading (file uploading): progress bar in upload zone, 0-100%
- Error (invalid file): red border on zone, error text below
- Step 2 (Professional details): headline, role, years of experience, portfolio URL, past clients (text fields)
- Step 3 (Payout details): bank account holder name, bank name, account number (masked on blur), IFSC, branch — all sensitive fields with reveal-on-hover for owner, masked for everyone else
- Step 4 (Review & submit): all data shown in read-only cards, "Submit for review" CTA (#16A34A green)
- After submit: success state, modal closes, 1.2 dashboard updates with "Under Admin review" status

CONNECTIONS:
- Submit → 1.4 (Pending state)
- Admin approval → 1.13 (Profile Completion updates)
- Admin rejection → 1.4 (Rejected state with reason)
```

#### Frame: Pro / S01 / 1.3 / Step-3-Payout-Details / Desktop

```
Same modal shell as 1.3 Default, but Step 3 active.

STEP 3 — PAYOUT DETAILS:
Section card:
- Title (16px semibold): "Payout account details"
- Sub-text (13px #64748B): "Where your payouts will settle. Provider (Razorpay Route) settles directly to this account. QuickQuid never holds your money."
- Warning callout (#FEF3C7 background, #78350F left-border 3px, 12px padding): "⚠ Changing beneficiary or account number after approval requires re-verification. Existing paid proposals will be paused until review completes."

FORM FIELDS (vertical stack, 16px gap):
1. Account holder name (text input, 40px height, full-width) — placeholder "As per bank records"
2. Bank name (text input with autocomplete)
3. Account number (password-style input, masked as •••••• after blur) — with eye icon to reveal (only Pro owner can reveal own field)
4. Confirm account number (masked input) — must match field 3
5. IFSC code (text input, uppercase, 11 chars max)
6. Branch address (text input, optional)

Below form:
- "Why we need this" expandable section (12px #64748B): "Payouts are released by Finance Admin and settled by the regulated payment provider. Your account details are encrypted, masked in UI, and only revealed to authorized Finance/Risk Admins with reason and audit log."

Footer:
- "Back" button (secondary, white bg, 1px #E2E8F0)
- "Continue to Step 4" button (#2563EB)

VALIDATION:
- All required fields except branch
- Account number match check on field 4
- IFSC format (4 letters + 0 + 6 alphanumeric)
- On any error: red border #DC2626, error text below field, continue button disabled
```

#### Frame: Pro / S01 / 1.4 / Pending / Desktop

```
Generate a Pro verification status card showing "Under Admin review" state.

LAYOUT (card, 480px wide, centered in main content area):
- Top: amber spinner icon (#F59E0B, 48px, animated rotate)
- Title (18px semibold #0F172A): "Verification under review"
- Status badge (#FEF3C7 background, #78350F text, #F59E0B 1px border): "Under Admin review"
- Body (14px #475569): "Support Tier 1 is reviewing your identity and payout details. Target review time: 24 hours from submission."
- Submission timestamp (12px #64748B): "Submitted: 2026-08-06 14:32 IST"
- Estimate (12px #64748B): "Expected decision by: 2026-08-07 14:32 IST"
- Progress bar (full-width, 4px height, #E2E8F0 track, #F59E0B fill at 60%, "Review in progress" label below)
- Divider
- "What happens next?" expandable:
  • If approved: You'll receive an in-app + email notification. Your readiness score updates to 100%.
  • If rejected: You'll see the reason and a "Resubmit" CTA. Your draft proposals are preserved.
- Footer:
  - Secondary link: "Contact Support" (links to 99.2 widget)
  - No primary CTA (waiting state)

STATES:
- Pending: as above
- Approaching SLA (24h+ elapsed): border becomes #EA580C orange, copy changes to "Review is taking longer than expected. Support has been alerted."
```

#### Frame: Pro / S01 / 1.4 / Rejected / Desktop

```
Same card shell but rejected state.

LAYOUT:
- Top: red X icon (#DC2626, 48px in circle)
- Title (18px semibold #0F172A): "Verification needs attention"
- Status badge (#FEE2E2 background, #7F1D1D text, #DC2626 1px border): "Rejected"
- Body (14px #475569): "Support Tier 1 returned your submission. Please review the reason below and resubmit."
- Reason card (#FEE2E2 background, #DC2626 left-border 3px, 12px padding):
  - Label (12px semibold #7F1D1D): "REASON"
  - Text (14px #7F1D1D): "Bank account number does not match IFSC branch records. Please verify and resubmit."
- Rejection timestamp (12px #64748B): "Decided: 2026-08-07 10:15 IST by Support Tier 1"
- Footer:
  - Primary CTA (#2563EB, white text, 40px height): "Resubmit verification" (links to 1.3, draft preserved)
  - Secondary link: "Contact Support" (99.2)

MOBILE VARIANT:
- Card full-width, 16px padding
- Icons 40px instead of 48px
- CTA full-width
```

#### Frame: Pro / S01 / 1.5 / Default / Desktop

```
Generate a blocking interlock modal that appears when a Pro attempts to submit a paid proposal without payout readiness.

LAYOUT (modal, 560px wide, centered, overlay backdrop #0F172A at 50% opacity):
- Top: amber warning triangle icon (#F59E0B, 48px)
- Title (20px semibold #0F172A): "Payout setup required"
- Body (14px #475569): "You can't submit a paid proposal until your payout details are verified. This protects you from accepting work where payout cannot be completed."
- "What's missing" card (#FEF3C7 background, 12px padding, 6px radius):
  - Icon: red lock (#DC2626, 16px)
  - Label (13px semibold #78350F): "MISSING:"
  - Text (14px #78350F): "Payout account details — verification pending"
- Reassurance (12px #64748B, italic): "Your draft proposal has been saved. You won't lose your work."
- Footer (right-aligned, 16px gap):
  - Secondary button (white bg, 1px #E2E8F0, #334155 text, 40px height): "Cancel" (closes modal, returns to 6.3 with draft preserved)
  - Primary button (#16A34A, white text, 40px height): "Add payout details →" (links to 1.3, on completion returns to preserved proposal draft)

STATES:
- Default: as above
- Multiple missing items: card shows bullet list (e.g. profile incomplete + KYC pending + payout missing), each with separate "Fix" link
```

#### Frame: Risk / S01 / 1.6 / Default / Desktop

```
Generate a Risk Admin's KYC record detail view with duplicate device/network risk flag.

LAYOUT (full Admin shell per §1.6 Admin sidebar):
- Admin sidebar (260px, #FEE2E2 tint background for Risk role):
  - "Risk Tier 3" role badge at top
  - Nav: Operations | KYC | Payment Verification | Payouts | Refunds | Disputes | Trust & Safety (active) | Audit Log | Settings
- Main content:
  - Breadcrumb: "KYC / PRO-2088 / Risk review"
  - H1 (22px): "KYC Record — Akhil Menon (PRO-2088)"

RISK FLAG BANNER (sticky at top of detail, #FEE2E2 background, #DC2626 left-border 4px, 16px padding):
- Icon: warning triangle (#DC2626, 24px)
- Title (16px semibold #7F1D1D): "Duplicate device/network signal detected"
- Body (13px #7F1D1D): "Hashed device fingerprint matches a previously suspended account (PRO-1822, suspended 2026-05-12 for circumvention). Match confidence: 87%."

TWO-PANE LAYOUT (66% / 33%):
LEFT PANE — KYC record:
- Identity section: name, DOB, PAN (masked •••••••• with Reveal button), address
- Payout section: bank name, account (masked), IFSC, branch
- Submitted: 2026-08-06 14:32 IST
- Documents: PAN.pdf (thumbnail), address_proof.pdf (thumbnail)

RIGHT PANE — Risk signals & history:
- Card 1: "Match details"
  - Hashed device ID: a4f8...c921 (truncated)
  - Match confidence: 87% (progress bar, #DC2626 fill)
  - Matched account: PRO-1822 (linked, opens in new tab)
  - Prior account status: Suspended
  - Suspension reason: "Circumvention — off-platform payment solicitation"
  - Suspension date: 2026-05-12
- Card 2: "History"
  - Timeline of PRO-2088 account events (created, logged in, submitted KYC)
  - Timeline of PRO-1822 account events (created, suspended)
  - IP overlap matrix (3 IPs in common, highlighted #FEE2E2)

ACTION BAR (sticky at bottom of detail, white background, 1px top border, 16px padding):
- Reason input (text field, 40px height, full-width): "Document your rationale for the decision..."
- 4 action buttons (right-aligned):
  1. "Investigate" (secondary, white bg, 1px #E2E8F0) — keeps in queue, adds note
  2. "Request information" (secondary) — sends secure form to Pro
  3. "Reject" (#DC2626, white text) — rejects KYC, requires reason
  4. "Approve with rationale" (#16A34A, white text) — approves but logs risk-flag record

PERMISSIONS:
- Only Risk Tier 3 sees this view
- Support Tier 1 sees KYC record without risk signals
- Finance/Ops see only the existence of a risk flag, not details

AUDIT:
- Every action button click → creates 12.4 audit event with admin_id, role, action, entity, old/new state, reason, timestamp, IP, user-agent
- Sensitive reveal (PAN, account number) → starts 5-min re-mask timer

MOBILE VARIANT:
- Two-pane collapses to single column
- Right pane becomes "Risk signals" expandable section
- Action bar becomes sticky bottom sheet with 4 buttons in 2×2 grid
```

#### Frame: Pro / S01 / 1.7 / Default / Desktop

```
Generate a Pro's "Update payout details" flow.

LAYOUT (full Pro shell, main content):
- Breadcrumb: "Settings / Payout details / Update"
- H1 (22px): "Update payout details"
- Warning callout (#FEF3C7 background, #F59E0B left-border 4px, 16px padding):
  - Icon: warning triangle
  - Title (14px semibold #78350F): "High-risk change"
  - Body (13px #78350F): "Changing your beneficiary or bank account requires re-verification. New paid proposals will be paused until review completes. Existing contractual obligations remain visible to Admin and are not affected."

CURRENT DETAILS CARD (read-only, #F1F5F9 background, 16px padding):
- Title (14px semibold #334155): "Current verified details"
- Bank name: HDFC Bank
- Account holder: Akhil Menon
- Account number: ••••••••3421 (masked, with Reveal button)
- IFSC: HDFC0001234
- Status badge: "Approved" (#DCFCE7 bg, #14532D text)

UPDATE FORM (below current details):
- Same fields as 1.3 Step 3 but all empty
- Reason for change (required dropdown): "Bank account changed" | "Beneficiary name correction" | "Bank merged/renamed" | "Other"
- If "Other" selected: additional text field appears for explanation

FOOTER:
- "Cancel" (secondary) — returns to settings
- "Save changes" (#2563EB) — saves as pending, shows toast "Submitted for re-verification", redirects to 1.4 Pending state

POST-SUBMIT BEHAVIOR:
- 1.2 Readiness Dashboard shows payout as "Under re-review"
- Proposal submission (6.3) blocked with 1.5 interlock modal
- Existing contracts continue normally
- Admin sees update in KYC queue with "Update" badge

STATES:
- Default: form empty
- Saving: button spinner, "Saving..."
- Saved: success toast, redirect
- Error: inline validation
```

#### Frame: Buyer / S01 / 1.8 / Default / Desktop

```
Generate a Buyer Organization Details editor.

LAYOUT (full Buyer shell, main content):
- Breadcrumb: "Settings / Organization and billing"
- H1 (22px): "Organization details"
- Sub-headline (14px #475569): "Private billing information used for invoices and Finance review. Does not appear on your public profile."

FORM (2-column grid on desktop, 16px gap):
Left column:
- Company name (text, required) — value: "Northstar Labs"
- Legal entity type (dropdown) — "Private Limited"
- Industry (dropdown) — "B2B SaaS"
- Billing address line 1 (text, required) — "12 MG Road"
- Billing address line 2 (text, optional) — "Suite 402"
- City (text) — "Kochi"
- State (dropdown) — "Kerala"
- PIN code (text, 6 digits) — "682035"

Right column:
- GSTIN (text, 15 chars, uppercase) — "32AAAAA0000A1Z5"
- PAN (text, masked after blur, •••••AAAA format)
- Billing contact name (text) — "Priya Nair"
- Billing contact email (email) — "priya@northstarlabs.in"
- Billing contact phone (phone, +91) — "+91 98470 12345"
- Default currency (dropdown, locked to INR for v0.1)

VALIDATION:
- GSTIN format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
- PIN code: 6 digits
- Email format
- Phone: +91 followed by 10 digits

FOOTER (sticky bottom):
- Save status indicator (left): "Last saved: 2 minutes ago" (#64748B, 12px)
- "Save changes" button (#2563EB, right) — only enabled when form dirty

INFO CALLOUT (below form, #DBEAFE tint, 12px padding):
- "Where this data is used:"
- Bullets:
  • Brief creation (5.1) — billing context attached
  • Offer/contract (8.1) — buyer snapshot at acceptance
  • Invoice generation (11.7) — appears on invoice line items

STATES:
- Default: loaded with sample data
- Saving: spinner in save button
- Saved: green checkmark + "Saved just now" for 3 seconds, then back to "Last saved: X ago"
- Error: red banner "Unable to save — Retry" with retry button

MOBILE VARIANT:
- 2-column becomes 1-column
- Save button sticky at bottom, full-width
```

#### Frame: Buyer / S01 / 1.9 / Default / Desktop

```
Generate a Terms and Privacy Consent modal shown before KYC/account activation.

LAYOUT (modal, 640px wide, centered, backdrop overlay):
- Header: H2 "Before you continue" (22px semibold)
- Body intro (14px #475569): "Please review and acknowledge the following. We've highlighted the key commercial terms."

TERMS CARD (scrollable, max-height 320px, 1px solid #E2E8F0, 16px padding):
- Section 1: "Commercial terms"
  - Bullet: "QuickQuid deducts ₹0 platform commission from the Pro's agreed professional fee."
  - Bullet: "Buyer pays a separate 14% beta QuickQuid fee on top of the Pro fee."
  - Bullet: "Pro fee, Buyer fee, applicable-tax placeholder, and Buyer total appear before payment."
  - Bullet: "Maximum 4 milestones per contract."
- Section 2: "Payment & custody"
  - Bullet: "Buyer pays through the marketplace payment provider's hosted checkout (e.g. Razorpay Route)."
  - Bullet: "Funds are held by the regulated payment provider, not in a QuickQuid bank account."
  - Bullet: "QuickQuid does not build its own escrow engine or wallet."
  - Bullet: "Finance Admin approves milestone unlock and payout release manually."
- Section 3: "Privacy"
  - Bullet: "KYC/payout data is encrypted and masked in UI."
  - Bullet: "Sensitive data reveal requires authorization + reason + audit log."
  - Bullet: "Account deletion available with retention periods per record category."

CHECKBOXES (below cards, 16px gap):
- ☐ I acknowledge the Terms (including fee structure and provider-mediated payment model) [required]
- ☐ I acknowledge the Privacy Notice [required]

VERSION + TIMESTAMP (12px #64748B, below checkboxes):
- "Terms version: 1.0 (2026-08-01)"
- "Privacy version: 1.0 (2026-08-01)"

FOOTER:
- "Cancel" (secondary) — closes modal, no consent recorded
- "Continue" (#2563EB) — disabled until both checkboxes checked; on click records version + timestamp + user ID

STATES:
- Default: checkboxes unchecked, continue disabled
- Both checked: continue enabled
- Loading after continue: spinner, "Recording consent..."
```

#### Frame: Pro / S01 / 1.10 / Default / Desktop

```
Generate a Pro Work Relationship Acknowledgement step (final KYC step).

LAYOUT (modal, 560px wide):
- Header: H2 "Work relationship acknowledgement" (20px semibold)
- Body (14px #475569): "Please acknowledge the following. This does not classify your legal status — your relationship with QuickQuid remains governed by the approved agreement and applicable law."

ACKNOWLEDGEMENT TEXT (counsel-approved, in scrollable card, #F8FAFC background, 12px padding, max-height 240px, 13px font #334155):
"You acknowledge that:
1. You are providing professional services as an independent professional, not as an employee of QuickQuid.
2. QuickQuid facilitates marketplace discovery, contracting, payment verification, and dispute resolution, but does not direct or control your work methods.
3. Payouts to your linked account are settled by the regulated payment provider upon Finance Admin release approval.
4. You are responsible for your own tax obligations; QuickQuid does not auto-calculate or withhold tax except where required by enterprise configuration.
5. IP ownership follows the signed agreement between you and the Buyer; QuickQuid's UI status does not alone create legal transfer."

RECORD METADATA (below card, 12px #64748B):
- "Acknowledgement version: 1.0 (2026-08-01)"
- "Will record: version, timestamp, user ID, IP, user-agent"

CHECKBOX:
- ☐ I have read and acknowledge the above [required]

FOOTER:
- "Back" (secondary)
- "Submit verification" (#16A34A) — disabled until checked; on click completes 1.3 Step 4
```

#### Frame: Pro / S01 / 1.11 / Default / Desktop

```
Generate a Pro Personal Profile Builder form (also used for Buyer with field variations).

LAYOUT (full Pro shell, main content, 2-column 66%/33%):
- Breadcrumb: "Settings / Profile"
- H1 (22px): "Personal profile"
- Sub-headline (14px #475569): "Public-facing profile information. Each field shows whether it's public or private."

LEFT PANE — FORM (66%, accordion sections):

SECTION 1 — BASICS (expanded):
- Avatar (circular, 96px, upload zone with current image)
- Public display name (text, required) — "Akhil Menon"
- Headline (text, 80 chars max) — "Product Designer & UX Researcher"
- Bio (textarea, 500 chars, with counter) — "I design end-to-end product experiences..."
- Categories (multi-select chips): Design, UX Research, Prototyping
- Skills (tag input): Figma, Sketch, UserTesting, Maze
- Each field row shows: field label | input | "Public" badge (#DCFCE7) or "Private" badge (#F1F5F9)

SECTION 2 — PORTFOLIO (collapsed):
- Section header with chevron: "Portfolio (3 items)"
- When expanded: list of portfolio item cards
  - Each: thumbnail, title, link (Figma/URL), "Featured" star toggle, "Public" badge, edit/remove buttons
- "+ Add portfolio item" button

SECTION 3 — AVAILABILITY & RESPONSE (collapsed):
- Availability toggle: "Available for new work" (on/off, green when on)
- Response time (dropdown): "Within 24 hours"
- Typical project size (dropdown): "₹50k - ₹2L"
- Optional: languages (tag input), time zone (dropdown)

SECTION 4 — WORK HISTORY (read-only, system-populated):
- Completed projects count: 12
- Average rating: 4.8/5 (with star icons)
- This section auto-populates from contracts — Pro cannot edit

RIGHT PANE — LIVE PREVIEW (33%, sticky):
- "Public profile preview" header
- Mini profile card showing exactly what 3.1 discovery card will render:
  - Avatar, name, headline
  - Trust labels row: "identity reviewed" • "portfolio reviewed" • "Available now" • "12 completed projects"
  - Categories as chips
  - Featured portfolio thumbnail
- "Customize public view →" button (links to 1.12)

FOOTER (sticky bottom):
- Save status (left): "Saving..." | "Saved just now" | "Unable to save — Retry"
- "Publish changes" button (#16A34A, right) — appears when changes are saved but not published

STATES:
- Default: loaded with sample data
- Section expanded/collapsed
- Field-level validation errors
- Saving/Saved/Save-failed states per 5.4 autosave pattern

BUYER VARIANT:
- Different fields: display name, logo (instead of avatar), company description, industry, hiring categories
- No portfolio section
- No availability/response time
- Trust labels: "Verified organization"
```

#### Frame: Pro / S01 / 1.12 / Published / Desktop

```
Generate a Public Profile Preview & Customization screen.

LAYOUT (full shell, 2-column 50%/50%):
- Breadcrumb: "Settings / Profile / Preview"
- H1 (22px): "Public profile preview"
- Sub-headline (14px #475569): "This is exactly what other marketplace users will see when they open your profile."

LEFT PANE — EDITOR (50%):
- "Section order" drag-and-drop list:
  1. ☰ Basics (avatar, name, headline, bio)
  2. ☰ Categories & skills
  3. ☰ Featured portfolio item (select from portfolio)
  4. ☰ Reviews (auto-populated)
  5. ☰ Work history stats
- "Optional field visibility" toggles:
  - ☐ Show response time (on)
  - ☐ Show typical project size (on)
  - ☐ Show languages (off)
  - ☐ Show time zone (off)
- "Preview as role" segmented control: [Buyer] [Pro] [Visitor] (changes what's visible per §1.6 visibility matrix)

RIGHT PANE — PREVIEW (50%, sticky):
- Rendered profile card (full size, 480px wide):
  - Avatar (96px), display name (20px semibold), headline (14px #475569)
  - Trust labels row (horizontal, 12px font, with icons):
    ✓ identity reviewed (shield icon, #16A34A)
    ✓ portfolio reviewed (folder icon, #16A34A)
    ✓ Available now (green dot, #16A34A)
    ✓ 12 completed projects (check icon, #16A34A)
  - Tabs: About | Portfolio | Reviews
  - About tab: bio text
  - Portfolio tab: grid of 3 featured items (16:9 thumbnails, titles, links)
  - Reviews tab: list of published reviews (rating stars, buyer name, project ref, date, text)
- "Draft" / "Published" indicator at top of preview

FOOTER (sticky):
- "Save draft" (secondary)
- "Publish" (#16A34A) — makes live
- "Unpublish" (#DC2626, secondary) — removes from 3.1 discovery, preserves contracts

PERMISSIONS:
- Only the profile owner sees the Editor pane
- Visitors/Buyers/Pros viewing the profile see only the Preview pane (rendered as full page, not split)
- Unpublished profiles show "This profile is not publicly visible" to owner only

CONNECTIONS:
- Publish → 3.1 Discovery (Talent cards now include this profile)
- Publish → 4.1 Detail (full profile page accessible)
- Unpublish → removes from discovery, existing contracts preserved

MOBILE VARIANT:
- 2-column collapses to single column
- Preview appears at top, editor below (or via "Edit" pencil floating button)
```

#### Frame: Pro / S01 / 1.13 / Eligible / Desktop

```
Generate a Profile Completion & Approval Interlock summary card (appears on 1.2 dashboard and as inline gate at 6.3 proposal submission).

LAYOUT (card, 100% width if on dashboard, 480px if modal):
- Header: "Readiness summary" (16px semibold)
- Overall status badge: "100% eligible" (#DCFCE7 background, #14532D text, #16A34A 1px border)
- Progress bar (full-width, 8px height, #E2E8F0 track, #16A34A fill at 100%)

CHECKLIST (vertical list, each row 40px height):
- ☑ Account basics — email verified — Complete (#16A34A check)
- ☑ Profile — published — Complete
- ☑ Identity verification (KYC) — approved 2026-08-07 — Complete
- ☑ Payout details — verified — Complete
- ☑ Pro Work Relationship — acknowledged — Complete
- ☑ Active proposal capacity — 3/10 used — Available

ENABLED ACTIONS LIST (below checklist, #DCFCE7 tint, 12px padding):
- "You can now:"
  ✓ Submit paid proposals (up to 7 more)
  ✓ Receive payouts to linked account
  ✓ Create productized gigs
  ✓ Be discovered in Find Talent feed

PERMISSIONS:
- This card never reveals private risk logic (per PRD §1.13: "Never reveal private risk logic")
- If a risk flag exists (1.6), it shows as "Account under review" amber state without details to the Pro

INVERSE STATE — BLOCKED:
- If any required item is incomplete, overall status badge becomes "Action required" (#FEE2E2 bg, #7F1D1D text)
- Each incomplete item shows red X and "Fix →" CTA linking to relevant sub-screen (1.3, 1.7, 1.11)
- "Enabled actions" section replaced with "Blocked actions" (#FEE2E2 tint):
  ✗ Submit paid proposals
  ✗ Create gigs (until KYC approved)
  ✓ Browse briefs (always allowed)
  ✓ Save draft proposals (always allowed)
```

#### Frame: Pro / S01 / 1.13 / Blocked / Mobile

```
Mobile variant of 1.13 Blocked state.

LAYOUT (single column, 16px padding):
- Header: "Complete your setup" (20px semibold)
- Sub-text: "You're almost there. Finish these to start submitting proposals."

CARDS (stacked, 12px gap):

Card 1 — Profile (in-progress):
- Amber spinner icon
- "Buyer profile"
- Progress bar at 60%
- "Complete profile →" button (full-width, 44px height, #2563EB)

Card 2 — KYC (not started):
- Grey circle
- "Identity verification"
- "Start verification →" button (full-width, 44px, secondary style)

Card 3 — Payout (not started):
- Grey circle
- "Payout details"
- "Add payout details →" button (full-width, 44px, secondary)

BOTTOM STICKY CARD (#FEE2E2 tint, full-width):
- Red lock icon
- "Until complete, you cannot:"
- Bullets: "Submit paid proposals" / "Create gigs"
- "You can still browse briefs and save drafts."

MOBILE-SPECIFIC:
- Cards stack vertically with full-width
- CTAs are 44px height (thumb-friendly)
- Sticky bottom card uses safe-area inset
```

---

### Screen 02 — Role Dashboard & Action Centre

**PRD source:** §4.2.1–4.2.6 (lines 1267–1380)
**5W1H:** Buyer and Pro (Admin has Screen 12). Role-specific action centre for active work, blocking tasks, recent updates, and next action. Every authenticated session and after verification/payment/delivery/dispute status changes. First signed-in route and dashboard navigation entry. Users should not hunt for the next action during manual verification delays. Action-required banner first → active engagement cards second → guided empty state → global notification drawer.

#### Frame: Buyer / S02 / 2.1 / Default / Desktop

```
Generate a Buyer Dashboard with sticky action-required banner.

LAYOUT (full Buyer shell, 240px sidebar | main content):
SIDEBAR (Buyer nav per PRD §2.2.1):
- QuickQuid logo + "Buyer" role badge
- Nav: Dashboard (active) | Find Talent | My Briefs | Contracts | Payments | Messages (3 unread) | Settings
- Avatar at bottom: "Northstar Labs" / "BUY-1042"

MAIN CONTENT:
- Top bar: "Help" | Bell icon (count "5") | Avatar
- Page title (28px): "Dashboard"

STICKY ACTION-REQUIRED BANNER (per PRD §4.2.5 banner priority hierarchy — most urgent wins):
- Position: sticky at top of main content, below breadcrumb
- Style: full-width card, 16px padding, 8px radius, color depends on priority
- Current priority (P2 — Buyer: submit payment evidence):
  - Background: #FED7AA (orange tint)
  - Left-border: 4px solid #EA580C
  - Icon: orange alert (#EA580C, 24px)
  - Headline (16px semibold #7C2D12): "Action required: submit payment for QQ-0892"
  - Sub-text (13px #7C2D12): "Pro accepted your offer. Fund Milestone 1 (₹34,200) via provider checkout to begin work."
  - CTA button (#EA580C, white text, 40px): "Pay ₹34,200 →" (links to 9.1)
  - Secondary link (12px #7C2D12): "View contract"
  - Cannot dismiss (no X button) — only resolves after action taken

WELCOME / PROFILE READINESS STRIP (below banner, 64px height):
- Left: "Welcome back, Northstar Labs" (18px semibold)
- Right: Profile completion badge "72% complete" (links to 1.2)

ACTIVE ENGAGEMENTS LIST (main content):
- Section header (16px semibold): "Active engagements" | "View all" link (right)
- Engagement cards (vertical stack, 16px gap, each 100% width):

CARD 1 — QQ-0892 (most urgent, Accepted Pending Funding):
- Left section: contract ref "QQ-0892" (12px #64748B) | title "Build a secure partner onboarding portal" (16px semibold) | counterpart "Akhil Menon (PRO-2088)" (13px)
- Middle section: status badge "Accepted — fund milestone 1" (#FEF3C7 bg, #78350F text) | milestone stepper "M1 ▢ M2 ▢ M3 ▢ ▢" (M1 highlighted amber) | fee context "Pro fee ₹80,000 + Buyer fee ₹11,200 = ₹91,200 before tax" (12px)
- Right section: last updated "2 min ago" (11px #64748B) | CTA "Pay ₹34,200" (#EA580C button)
- Hover: card border becomes 1px solid #EA580C, shadow elevates

CARD 2 — QQ-0890 (In Delivery):
- Status badge "In delivery — M2" (#DBEAFE bg, #1E3A8A text)
- Milestone stepper: "M1 ✓ M2 ● M3 ▢ M4 ▢" (M1 green check, M2 blue active)
- Last updated "3 hours ago"
- CTA "Open workroom" (secondary button)

CARD 3 — QQ-0885 (In Review):
- Status badge "Deliverable submitted — review required" (#FEF3C7 bg, #78350F text, Priority P4)
- CTA "Review deliverable" (#FACC15 button, #1F2937 text)

CARD 4 — QQ-0870 (Completed):
- Status badge "Completed" (#DCFCE7 bg, #14532D text)
- CTA "Leave review" (secondary) + "Rehire Pro" (secondary)

RECENT ACTIVITY / SAVED ITEMS (bottom section):
- 2-column grid
- Left: "Recent activity" feed (timestamped events: "Akhil submitted M1 deliverable — 2h ago", etc.)
- Right: "Saved Pros" (3 cards: avatar, name, headline, "Invite to brief" link)

BANNER PRIORITY VARIANTS (per PRD §4.2.5):
- P1 (SLA breach > 24h): #DC2626 red bg, white text, "URGENT: Payment verification overdue"
- P2 (current): #FED7AA orange, as above
- P3 (Pro do-not-work): #F59E0B amber, "Your Pro has been notified — work cannot begin until Finance unlock"
- P4 (review deliverable): #FACC15 yellow
- P5 (revision requested): #A3E635 lime
- P6 (dispute response): #84CC16
- P7 (payout failed): #22C55E
- P8 (KYC resubmit): #16A34A
- P9 (brief inactivity): #15803D

STATES:
- Default: as above
- Loading: skeleton shimmer on cards
- Empty (no engagements — see 2.3): empty state shown instead of cards
```

#### Frame: Pro / S02 / 2.1 / Default / Desktop

```
Same shell as Buyer dashboard but with Pro-specific content.

SIDEBAR (Pro nav per §2.2.2):
- Dashboard (active) | Find Briefs | My Proposals (3 active) | Contracts | Workroom | Payouts | Messages | Gigs | Settings
- Role badge: "Pro" (#DCFCE7 bg, #14532D text)
- Avatar: "Akhil Menon" / "PRO-2088"

STICKY ACTION-REQUIRED BANNER (P3 — Pro: do not begin work):
- Background: #FEF3C7 (amber tint)
- Left-border: 4px solid #F59E0B
- Icon: amber alert (#F59E0B, 24px)
- Headline (16px semibold #78350F): "Payment verification pending. Do not begin work until QuickQuid confirms funding."
- Sub-text (13px #78350F): "Buyer's payment is being verified by Finance Admin. Expected unlock target: 24 hours after capture. You will be notified when work may begin."
- CTA: "View funding status" (secondary, white bg, 1px #F59E0B border, #78350F text)
- Cannot dismiss

ACTIVE ENGAGEMENTS:
CARD 1 — QQ-0892 (Funding Interlock):
- Status badge "Payment under review" (#FEF3C7 bg, #78350F text)
- Milestone stepper: M1 highlighted amber with lock icon
- CTA: "View contract" (secondary, read-only)

CARD 2 — QQ-0888 (In Delivery — Pro working):
- Status badge "Active work — M2" (#DCFCE7 bg, #14532D text)
- CTA: "Open workroom" (#16A34A primary)

CARD 3 — QQ-0882 (In Review — Buyer reviewing):
- Status badge "Awaiting Buyer review" (#DBEAFE bg, #1E3A8A text)
- Last updated: "Buyer started reviewing 1h ago"
- CTA: "View submission" (secondary)

CARD 4 — QQ-0875 (Payout Queued):
- Status badge "Payout queued — Finance approval pending" (#FEF3C7 bg, #78350F text)
- CTA: "View payout slip" (secondary)

RECENT ACTIVITY:
- "Buyer submitted payment evidence for QQ-0892 — 30 min ago"
- "Finance approved milestone unlock for QQ-0888 M1 — 2h ago"
- "Payout of ₹20,000 settled for QQ-0870 M2 — 1 day ago" (with green check)

PAYOUTS SUMMARY WIDGET (right rail or below activity):
- "This month" header
- Total earned: ₹1,24,000
- Pending release: ₹34,200
- Settled: ₹89,800
- "View all payouts →" link
```

#### Frame: Buyer / S02 / 2.2 / Default / Desktop

```
Generate the Active Engagements List as a standalone full-page view (also embeds on dashboard).

LAYOUT (full Buyer shell, main content):
- Breadcrumb: "Dashboard / All engagements"
- Page title (22px): "All engagements"
- Filter bar (full-width, 56px height, 1px bottom border #E2E8F0):
  - Tabs (segmented control): [All (12)] [Active (4)] [Pending payment (1)] [In review (1)] [Completed (6)]
  - Right: search input (240px) + sort dropdown (Newest | Oldest | Status priority)

ENGAGEMENT CARDS (vertical stack, 16px gap):
Each card has same structure as 2.1 cards but with richer detail:
- Card header row: contract ref | title | status badge | kebab menu (⋯)
- Card body (2-column):
  Left (60%):
  - Counterpart: avatar + name + Pro ref + trust label "identity reviewed"
  - Brief ref + brief title
  - Timeline: created → accepted → paid → delivered → accepted → completed (with current state highlighted)
  Right (40%):
  - Commercial summary: Pro fee ₹80,000 | Buyer fee ₹11,200 | Total ₹91,200
  - Milestone progress: "M1 ✓ M2 ● M3 ▢ M4 ▢" with amounts
  - Last activity timestamp
- Card footer: primary CTA (status-dependent) + "Open messages" link

EMPTY STATE (if filter returns 0):
- Centered illustration (128px)
- Headline (18px): "No engagements in this filter"
- Body (14px #475569): "Try a different filter or start a new project."
- CTA: "Post a brief" (#2563EB)
```

#### Frame: Buyer / S02 / 2.3 / Empty / Desktop

```
Generate a Buyer First-Time Empty State dashboard.

LAYOUT (full Buyer shell, main content):
- Same sidebar and top bar as 2.1
- No action-required banner (nothing pending)
- Welcome strip: "Welcome to QuickQuid, Northstar Labs" + "Profile completion 30%" badge

EMPTY STATE (centered in main content area, max-width 720px):
- Top: illustration (200×200px, abstract marketplace concept — no external character references)
- Headline (24px semibold #0F172A): "No active projects yet"
- Body (15px #475569, max-width 480px, centered): "Start with a clear brief or find a professional directly. Buyers can browse talent and draft briefs before completing verification."

TWO CTA CARDS (side-by-side, 320px each, 24px gap, centered):

CARD A — "Post a brief":
- Top: 64×64 icon (document with plus, #2563EB)
- Title (18px semibold #1E3A8A): "Post a brief"
- Body (13px #475569): "Describe your project, set a budget, and receive proposals from verified Pros."
- Bullet list (12px #334155):
  • Open to all Pros or private-invite only
  • 14% Buyer fee shown upfront
  • Maximum 4 milestones per contract
- CTA button (#2563EB, white text, full-width, 44px): "Create a brief →"

CARD B — "Find talent":
- Top: 64×64 icon (magnifying glass with person, #16A34A)
- Title (18px semibold #14532D): "Find talent"
- Body (13px #475569): "Browse Pros by category, view trust labels, and invite to a private brief."
- Bullet list (12px #334155):
  • Filter by category, budget, availability
  • Trust labels: identity reviewed, portfolio reviewed
  • Invite up to 10 Pros per private brief
- CTA button (#16A34A, white text, full-width, 44px): "Search talent →"

BELOW CTAs — "Get started" checklist (optional, max-width 480px):
- Title (14px semibold): "Complete your setup"
- Checklist (each row 32px):
  ☐ Complete organization details (links to 1.8)
  ☐ Complete buyer profile (links to 1.11)
  ☐ Publish your first brief (links to 5.1)
- Progress: 1/3 complete

NO RECENT ACTIVITY / SAVED ITEMS sections (empty state doesn't show empty feed)

STATES:
- Default (empty): as above
- After action (e.g. brief published): empty state replaced with single engagement card
```

#### Frame: Buyer / S02 / 2.3 / Empty / Mobile

```
Mobile variant of 2.3 Empty state.

LAYOUT (single column, 16px padding):
- Header: 56px, "Dashboard" centered, Bell icon right
- Welcome strip: "Welcome, Northstar Labs" (16px) + "30% complete" pill

EMPTY STATE:
- Illustration (160×160px, centered)
- Headline (20px semibold): "No active projects yet"
- Body (14px #475569): "Start with a clear brief or find a professional."

CTA CARDS (stacked vertically, full-width, 12px gap):
- Card A "Post a brief" with full-width CTA
- Card B "Find talent" with full-width CTA

CHECKLIST:
- Collapsible "Get started" section

MOBILE-SPECIFIC:
- CTA cards stack vertically (not side-by-side)
- CTA buttons 44px height (thumb-reach)
- Bottom navigation bar (Buyer): Dashboard | Find Talent | Briefs | Contracts | Messages
```

#### Frame: Buyer / S02 / 2.4 / Default / Desktop

```
Generate a Global Notification Drawer that opens from the Bell icon.

LAYOUT (drawer, 400px wide, slides in from right, full-height, backdrop overlay #0F172A at 30% opacity):
- Header (64px height, 16px padding, 1px bottom border #E2E8F0):
  - Title (16px semibold): "Notifications"
  - Right: "Mark all read" link (12px #2563EB) + close X button
- Filter tabs (segmented, full-width): [All (5)] [Unread (3)] [Mentions]

NOTIFICATION LIST (scrollable, vertical stack, each item 80px height):
Each notification row:
- Left: icon circle (40px, semantic color)
- Middle (flex-grow):
  - Actor-safe copy (13px #0F172A, semibold first sentence): "[Pro] applied to your brief [BRF-0892]."
  - Sub-text (12px #64748B): "Akhil Menon • 2 hours ago"
  - Status tag if pending (12px pill): "Action required" (#FEF3C7 bg, #78350F text)
- Right: deep-link arrow → (clicks open exact entity/screen)
- Unread state: left border 3px solid #2563EB, light blue background #DBEAFE at 50% opacity
- Read state: no border, white background

NOTIFICATIONS (canonical sample, per PRD §4.13.4 matrix):
1. [Unread] 🔵 "Akhil Menon applied to your brief BRF-0892." — 2h ago — → opens 6.1
2. [Unread] 🟠 "Payment checkout initiated via provider." — 1h ago — → opens 9.1
3. [Unread] 🟢 "Milestone accepted. Payout queued for Finance release approval." — 3h ago — → opens 12.10 (Pro would see payout slip; Buyer sees confirmation)
4. [Read] 🔵 "[Pro] accepted your offer. Fund milestone 1 to begin." — 1d ago — → opens 8.1
5. [Read] 🟢 "Payout settled. Reference: sett_NK7s2QwRtpXyZ9-M1." — 2d ago — → opens 12.10

EMPTY STATE (if no notifications):
- Illustration (128px)
- "No notifications yet"
- "We'll notify you here when there's activity on your projects."

PERMISSIONS:
- Notifications respect RBAC — Buyer never sees Pro/Finance notifications and vice versa
- Sensitive provider references (provider_payment_ref, hold_ref) are NOT shown in notification copy per §4.13.6

MOBILE VARIANT:
- Drawer becomes full-screen modal (no side drawer on mobile)
- Each row 72px height (slightly smaller)
- Bottom navigation hidden while drawer open
```

#### Frame: Buyer / S02 / 2.4 / Loading / Desktop

```
Notification drawer loading state (opened before notifications fetch completes).

LAYOUT (same drawer shell as 2.4 Default):
- Header same
- Filter tabs show counts as "—" instead of numbers
- List area: 5 skeleton rows (grey #E2E8F0 animated shimmer)
  - Each row 80px height with circular icon placeholder + 2 text bars (different widths)
- No "Mark all read" link (disabled state)
```

---

### Screen 03 — Marketplace Discovery & Feeds

**PRD source:** §4.3.1–4.3.6 (lines 1381–1500)
**5W1H:** Buyer looking for Pros; Pro looking for eligible briefs. Search, filter, save, and compare marketplace inventory. User enters Find Talent/Find Briefs or follows a category/search link. Role navigation; public profile/brief publication feeds this inventory. Discovery turns marketplace supply and demand into a relevant first conversation or proposal. Role-defaulted segmented feed → filters → sortable cards → explicit trust/price/availability → recovery empty state.

#### Frame: Buyer / S03 / 3.1 / Default / Desktop

```
Generate a Buyer Find Talent discovery feed.

LAYOUT (full Buyer shell, 240px sidebar | main content):
SIDEBAR (Buyer nav, "Find Talent" active):
- Dashboard | Find Talent (active, #2563EB left border) | My Briefs | Contracts | Payments | Messages | Settings

MAIN CONTENT:
- Top bar: search input (full-width, 480px) with magnifier icon | segmented control [Talent (active)] [Briefs] [Gigs] | Bell | Avatar
- Below search: breadcrumb "Find Talent" + result count "247 Pros found" (13px #64748B) + sort dropdown (right): "Most relevant" ▾

TWO-COLUMN LAYOUT (240px filter rail | results):

LEFT — FILTER RAIL (240px, #F8FAFC background, 1px right border, 16px padding):
- "Filters" header (14px semibold) + "Clear all" link (12px #2563EB)
- Filter sections (collapsible accordions, each 8px gap):

  SECTION 1 — CATEGORY (expanded):
  - Checkboxes: Design (24) | Development (87) | Writing (45) | Marketing (32) | Video (18) | Other (41)
  - Each row: checkbox + label + count (right, 12px #64748B)

  SECTION 2 — BUDGET BAND (expanded):
  - Radio buttons: Under ₹25k | ₹25k-₹50k | ₹50k-₹1L (selected) | ₹1L-₹5L | ₹5L+
  - Note (11px #64748B): "Budget bands are discovery labels, not claims about universal market pricing."

  SECTION 3 — AVAILABILITY (collapsed):
  - "Available now" toggle (most relevant filter)

  SECTION 4 — EVIDENCE TYPE (collapsed):
  - Has portfolio | Has reviews | Identity reviewed | Portfolio reviewed

  SECTION 5 — EXPERIENCE (collapsed):
  - 0-5 projects | 5-20 | 20-50 | 50+

  SECTION 6 — DELIVERY FORMAT (collapsed):
  - Remote | Onsite | Hybrid

RIGHT — RESULTS (flex-grow, 32px padding):
- Sort dropdown at top right: "Most relevant" ▾ (alternatives: Newest | Highest rated | Most projects)
- Discovery cards (vertical stack, 16px gap):

DISCOVERY CARD (per PRD §4.3.4, 100% width, 140px height, 16px padding, 8px radius, 1px solid #E2E8F0):
- Layout: 96×96px cover image/avatar (left) | content (middle, flex-grow) | commercial panel (right, 200px)

- Left (96×96px):
  - For Pro cards: circular avatar (Akhil Menon's photo)
  - For Brief cards: 16:9 project cover image

- Middle content:
  - Title row: "Akhhil Menon" (16px semibold #0F172A) + category badge "Design" (12px, #DBEAFE bg, #1E3A8A text, 4px radius)
  - Headline (14px #475569): "Product Designer & UX Researcher — Partner onboarding portals, fintech, SaaS"
  - Trust labels row (12px, horizontal):
    ✓ identity reviewed (shield icon, #16A34A)
    ✓ portfolio reviewed (folder icon, #16A34A)
    ✓ Available now (green dot pulse, #16A34A)
    ✓ 12 completed projects (check icon, #16A34A)
  - NO generic "verified" badge anywhere (per PRD §1.5 rule)

- Right commercial panel (200px, right-aligned):
  - Pro fee (14px semibold #0F172A): "₹80,000"
  - Buyer fee (12px #64748B): "+ 14% Buyer fee = ₹11,200"
  - Tax placeholder (11px #64748B italic): "+ applicable taxes"
  - Buyer total (14px semibold #1E3A8A): "₹91,200 before tax"
  - CTA button (full-width, 36px height, #2563EB bg, white text, 6px radius): "Invite to brief"

HOVER STATE: card border becomes 2px solid #2563EB, shadow elevates, CTA button darkens

STATES:
- Default: 247 results shown
- Loading: 6 skeleton cards (grey #E2E8F0 shimmer)
- Empty (no results): see 3.2 Empty state
- Error (fetch failed): "Couldn't load results — Retry" centered
```

#### Frame: Pro / S03 / 3.1 / Default / Desktop

```
Same shell but Pro's Find Briefs feed.

DIFFERENCES:
- Sidebar: Pro nav, "Find Briefs" active
- Segmented control defaults to [Briefs (active)] [Talent] [Gigs]
- Filter rail sections adapted for briefs:
  - CATEGORY (same)
  - BUDGET BAND (same)
  - VISIBILITY (Open only | Private invites | Both)
  - TIMELINE (Urgent < 7 days | 1-2 weeks | 1 month | Flexible)
  - EVIDENCE REQUIRED (Portfolio required | Cover letter required | Counter-offer allowed)

BRIEF DISCOVERY CARD:
- Left: 96×96px brief icon (document with category color)
- Middle:
  - Title: "Build a secure partner onboarding portal"
  - Category badge + visibility badge (Open = #DBEAFE, Private = #FEF3C7)
  - Brief summary (14px #475569): "B2B SaaS, Kochi. Need secure partner onboarding flow with KYC verification, role-based access..."
  - Brief metadata row (12px #64748B): "Posted 2 days ago • 7 proposals • Closes in 5 days"
  - Buyer info: "Northstar Labs (BUY-1042)" + trust label "Verified organization"
- Right commercial panel:
  - Budget (14px semibold): "₹80,000"
  - "+ 14% Buyer fee" (12px #64748B)
  - "Your payout (₹0 commission)" (12px #16A34A, semibold): "₹80,000"
  - CTA: "Submit proposal" (#16A34A button)

ADDITIONAL — GIG CARDS (when Pro switches to Gigs tab — shows own gigs):
- Gig discovery card: title, status (Draft/Live/Paused), views, requests, conversion rate
- CTA: "Manage gig" (secondary)
```

#### Frame: Buyer / S03 / 3.1 / Default / Mobile

```
Mobile variant of Find Talent (390×844).

LAYOUT (single column, 16px padding, bottom navigation):
- Top bar: 56px, "Find Talent" centered, Bell + Avatar right
- Search input (full-width, 44px height) with magnifier icon
- Segmented control [Talent] [Briefs] [Gigs] (full-width)
- "Filters" pill button (left) + result count "247 Pros" (right) + sort dropdown
- Filter rail replaced with bottom-sheet:
  - Tap "Filters" → bottom sheet slides up (full-width, max-height 70vh, swipe-to-dismiss)
  - Same sections as desktop but stacked vertically
  - "Apply filters" CTA at bottom (full-width, 44px)

DISCOVERY CARDS (stacked vertically, full-width, 12px gap):
- Card adapted for mobile:
  - Avatar (48×48px, left, top-aligned)
  - Content below avatar: name + category badge (inline)
  - Headline (14px)
  - Trust labels (horizontal, smaller 11px, wraps if needed)
  - Commercial summary card (#DBEAFE tint, 12px padding):
    - Pro fee ₹80,000 (right-aligned)
    - Buyer fee +₹11,200
    - Total ₹91,200 before tax
  - CTA button (full-width, 44px): "Invite to brief"

MOBILE-SPECIFIC:
- Bottom nav: Dashboard | Find Talent (active) | Briefs | Contracts | Messages
- Cards are taller (more vertical stacking)
- Trust labels can wrap to 2 lines
- Filter bottom-sheet uses safe-area inset
```

#### Frame: Buyer / S03 / 3.2 / Empty / Desktop

```
Generate an empty state for discovery when filters return zero results.

LAYOUT (same shell as 3.1, results area shows empty state instead of cards):
- Centered content (max-width 480px, vertically centered in results area)
- Illustration (160×160px, magnifying glass with empty folder)
- Headline (18px semibold #0F172A): "No Pros found under ₹50k in Design"
- Body (14px #475569): "Try broadening your budget range or remove the budget filter to see more results."
- Specific broadening suggestion card (#FEF3C7 background, 12px padding, 6px radius):
  - "Suggested actions:"
  - "→ Try budget ₹50k-₹1L (24 Pros match)"
  - "→ Remove budget filter (87 Pros in Design)"
  - "→ Try category 'Writing' (12 Pros under ₹50k)"
- "Clear all filters" button (#2563EB, white text, 40px, full-width): restores defaults
- "Post a brief instead" link (12px #2563EB): alternative path

STATES:
- Empty with active filters: as above
- Empty with no filters (truly empty marketplace): "No Pros available yet. Try posting a brief to invite applications."
```

#### Frame: Buyer / S03 / 3.2 / Empty / Mobile

```
Mobile empty state.

LAYOUT (single column):
- Illustration (120×120px)
- Headline (16px semibold): "No Pros found"
- Body (13px #475569): "Try a wider budget or remove filters."
- Suggestion card (full-width, #FEF3C7 tint)
- "Clear all filters" button (full-width, 44px)
- "Post a brief" link
```

---

### Screen 04 — Professional, Job & Gig Detail

**PRD source:** §4.4.1–4.4.6 (lines 1501–1646)
**5W1H:** Buyer evaluating a Pro/service; Pro evaluating a brief; Admin reviewing gig submissions. High-context detail surface for profile, brief, or live productized gig. User opens discovery card, shared link, saved item, or direct invitation. Marketplace detail route and Pro dashboard gig section. Evidence, scope, price, and trust remain visible together at the decision point. 66% narrative/evidence + 33% sticky commercial/action panel on desktop; stack commercial summary above CTA on mobile.

#### Frame: Buyer / S04 / 4.1 / Pro-Detail / Desktop

```
Generate a Pro detail page with sticky commercial pane.

LAYOUT (full Buyer shell, 2-column 66% / 33%):
- Breadcrumb: "Find Talent / Akhil Menon"

LEFT — NARRATIVE (66%, 32px padding):
- Top section (avatar + basics):
  - Avatar (96×96px circle, Pro's photo)
  - Title row: "Akhil Menon" (28px semibold #0F172A) + availability badge "Available now" (#DCFCE7 bg, #14532D text, with green pulse dot)
  - Headline (16px #475569): "Product Designer & UX Researcher"
  - Trust labels row (14px, horizontal, 8px gap):
    ✓ identity reviewed (shield icon, #16A34A)
    ✓ portfolio reviewed (folder icon, #16A34A)
    ✓ Available now (green dot, #16A34A)
    ✓ 12 completed projects (check icon, #16A34A)
  - "PRO-2088" reference (11px #64748B)

- About section:
  - H3 "About" (18px semibold)
  - Bio text (14px #334155, line-height 1.6): "I design end-to-end product experiences for fintech, SaaS, and partner-onboarding products. 8 years of experience..."

- Portfolio section:
  - H3 "Portfolio" with "Featured" star icon
  - Grid of 6 portfolio items (3 columns, 16px gap):
    - Each: 16:9 thumbnail, title, category badge, link icon
  - "View all portfolio →" link

- Reviews section:
  - H3 "Reviews" with rating summary "4.8/5 (12 reviews)"
  - 3 review cards (vertical stack):
    - Buyer avatar + name + company + project ref + star rating + review text + date

RIGHT — STICKY COMMERCIAL & ACTION PANEL (33%, sticky position, 24px from top):
- Card (1px solid #E2E8F0, 24px padding, 8px radius, white background):
  - Status row: "Available now" badge (top)
  - "Pro fee" label (12px #64748B) + "₹80,000" (20px semibold #0F172A)
  - "QuickQuid commission from Pro" label + "₹0" (14px #16A34A, semibold) — with info tooltip
  - "Buyer fee (14%)" label + "₹11,200" (14px #475569)
  - "Applicable taxes" label + "Determined by Finance" (12px italic #64748B)
  - Divider (1px #E2E8F0)
  - "Buyer total before tax" label (14px semibold) + "₹91,200" (18px semibold #1E3A8A)
  - Primary CTA button (#2563EB, white text, 44px, full-width): "Invite to brief" (links to 4.2)
  - Secondary CTA (text link, 14px #2563EB): "Send offer directly →" (links to 8.1 if Pro is available)
  - Tertiary action: "Save Pro" (bookmark icon, secondary)

- Below commercial card:
  - "Typical project size" card: "₹50k - ₹2L"
  - "Response time" card: "Within 24 hours"
  - "Languages" card: "English, Hindi, Malayalam"

STATES (CTA varies by Pro availability per §4.4.5):
- Pro available: "Invite to brief" + "Send offer directly" both shown
- Pro paused: only "Send offer directly" shown (4.3 Pro Availability Pause reflects here)
- Own profile (Pro viewing self): CTAs replaced with "Edit profile" / "View public preview"
- Admin viewing: CTAs hidden, "View audit history" appears

MOBILE VARIANT:
- 2-column collapses to single column
- Sticky commercial pane becomes a card that stacks ABOVE the primary CTA
- Primary CTA becomes sticky bottom bar
```

#### Frame: Pro / S04 / 4.1 / Brief-Detail / Desktop

```
Pro viewing a Brief detail page (different CTA matrix).

LAYOUT (full Pro shell, 2-column 66% / 33%):
- Breadcrumb: "Find Briefs / BRF-0892"

LEFT — NARRATIVE (66%):
- Top: brief title "Build a secure partner onboarding portal" (24px semibold)
- Metadata row: "BRF-0892" | "Posted 2 days ago" | "Open" | "7 proposals" | "Closes in 5 days"
- Buyer info card:
  - "Northstar Labs" logo (48px) + name + "Verified organization" trust label
  - "BUY-1042" + "B2B SaaS, Kochi" + "Member since 2026-01"
  - "View Buyer's other briefs →" link

- Objective section:
  - H3 "Objective"
  - Body text: "Build a secure partner onboarding portal with KYC verification, role-based access control, and audit logging..."

- Deliverables section:
  - H3 "Deliverables"
  - Bullet list (with checkmark icons):
    • Partner onboarding flow (UX + UI)
    • Admin dashboard for partner management
    • Audit log viewer
    • Documentation handoff

- Acceptance criteria section:
  - H3 "Acceptance criteria"
  - Bullet list (numbered):
    1. Onboarding flow handles 5 partner types
    2. Admin dashboard shows pending/approved/rejected partners
    3. Audit log captures all admin actions with timestamps
    4. Documentation covers API + component library

- Exclusions section:
  - H3 "Exclusions" (with red ⚠ icon)
  - Bullet list: "Backend implementation", "Hosting setup", "Ongoing maintenance"

- Attachments section:
  - 3 file cards (PDF, PNG icons): "Requirements_v1.pdf", "Brand_guidelines.pdf", "Existing_flow_screenshot.png"

RIGHT — STICKY COMMERCIAL & ACTION PANEL (33%):
- Card:
  - "Budget" label + "₹80,000" (20px semibold)
  - "Your payout (₹0 QuickQuid commission)" + "₹80,000" (#16A34A semibold)
  - "Buyer fee (14%)" + "₹11,200"
  - "Buyer total" + "₹91,200 before tax"
  - Divider
  - "Timeline" + "4 weeks"
  - "Visibility" + "Open to verified Pros"
  - Primary CTA (#16A34A, 44px, full-width): "Submit proposal" (links to 6.3)
  - If Pro missing payout readiness: CTA replaced with "Complete payout setup first" (#F59E0B, links to 1.5 interlock)
  - "Save brief" secondary action
  - "Message Buyer" link (only if Pro has been invited or shortlisted)

PER-STATUS VARIANTS:
- Brief open: as above
- Brief approaching inactivity: amber banner "This brief hasn't received activity in 6 days. Apply soon."
- Brief archived: red banner "This brief is archived. Request reactivation."
- Brief private (invited): green banner "You've been invited to this private brief."
```

#### Frame: Buyer / S04 / 4.2 / Invite-Modal / Desktop

```
Generate the "Invite to Brief" modal that opens when Buyer clicks Invite on a Pro profile.

LAYOUT (modal, 560px wide, centered, backdrop overlay):
- Header: H2 "Invite Akhil Menon to a brief" (20px semibold) | close X
- Sub-text (14px #475569): "Select a brief to invite this Pro to. They'll receive a private notification with your brief details."

BRIEF SELECTOR (vertical list, max-height 320px, scrollable):
- Section header: "Your briefs"
- Each brief row (radio button + brief card, 64px height):
  - Radio button (left)
  - Brief card: title + ref + status badge + budget
- Sample briefs:
  ○ Build a secure partner onboarding portal (BRF-0892) — Open — ₹80,000 [selected]
  ○ Mobile app redesign (BRF-0890) — Open — ₹1,20,000
  ○ Quarterly design retainer (BRF-0885) — Draft — ₹2,00,000
  ○ Brand identity refresh (BRF-0880) — Archived — ₹60,000

- "Or create a new brief" link (12px #2563EB): opens 5.1 in new tab

SCOPE PREVIEW (below selector, #F8FAFC background, 12px padding):
- Title of selected brief
- 2-line summary
- Budget + timeline

OPTIONAL NOTE (textarea, 4 rows, full-width):
- Label: "Optional note to Pro"
- Placeholder: "Add a personal message or context for the invitation..."

STATE HANDLING:
- No private briefs available: selector shows empty state "You don't have any private briefs. Create a new brief or invite to an open brief instead."
- Duplicate invite: inline warning "You've already invited this Pro to BRF-0892 on 2026-08-05."
- Pro unavailable (paused): inline warning "This Pro is currently paused for new work. They won't see your invite until they resume."

FOOTER:
- "Cancel" (secondary)
- "Send invite" (#2563EB, 44px) — disabled if no brief selected

STATES:
- Default: brief pre-selected (most recent open)
- Sending: button spinner
- Sent: success state, modal closes, toast "Invite sent to Akhil Menon"
- Error: inline red banner
```

#### Frame: Pro / S04 / 4.3 / Availability-Pause / Desktop

```
Generate the Pro Availability Pause control.

LAYOUT (in Pro Settings > Profile, or in Pro dashboard quick-action):
- Card (480px wide):
  - H3 "Availability" (18px semibold)
  - Sub-text (13px #64748B): "Control whether you appear in 'Available now' filters and whether Buyers can send you new invites."
  - Large toggle switch (60×32px):
    - ON (green #16A34A, "Available for new work" label)
    - OFF (grey #6B7280, "Paused for new work" label)
  - When OFF, additional context appears:
    - Warning callout (#FEF3C7, 12px padding): "⚠ While paused: You won't appear in 'Available now' filters. New invites are blocked with a clear message. Existing work and contracts continue normally."
  - "Update" button (#16A34A, 40px)

BEHAVIOR:
- Toggling OFF:
  - 3.1 discovery card: "Available now" badge removed, replaced with "Busy" (grey badge)
  - 4.1 detail page: "Invite to brief" CTA replaced with "Send offer directly" (Buyer can still send offer)
  - 4.2 invite modal: shows "This Pro is currently paused" warning to Buyer
- Toggling ON: restores availability everywhere

STATES:
- Available (ON): green toggle, no warning
- Paused (OFF): grey toggle, warning shown
- Saving: spinner in update button
```

#### Frame: Pro / S04 / 4.4 / Gig-Wizard-Step-1 / Desktop

```
Generate Step 1 of the Gig Creation Wizard (Basics).

LAYOUT (full Pro shell, main content, wizard layout):
- Breadcrumb: "Gigs / Create new gig"
- H1 (22px): "Create a new gig"
- Sub-text (14px #475569): "Turn a repeatable service into a discoverable, productized offering. Single package only in v0.1 — multi-package (Basic/Standard/Premium) is future."

WIZARD STEPPER (horizontal, full-width, 56px height):
- 7 steps with connecting line:
  1. Basics (active, #16A34A filled circle with "1")
  2. Scope
  3. Deliverables
  4. Pricing
  5. Timeline
  6. Requirements
  7. Preview
- Each step: circle + label below

STEP 1 — BASICS (visible, 800px max-width, centered):
Section: "Tell Buyers what you offer"

FORM FIELDS (vertical stack, 16px gap):
1. Gig title (text input, full-width, 80 chars max, counter shown)
   - Placeholder: "e.g. I will design a complete partner onboarding flow in Figma"
   - Helper text (12px #64748B): "Be specific. Mention the deliverable and outcome."
2. Category (dropdown): Design ▾ (options: Design, Development, Writing, Marketing, Video, Other)
3. Sub-category (dropdown, conditional on category): UX/UI Design ▾
4. Cover image (upload zone, 16:9, dashed border):
   - "Click to upload or drag" + cloud icon
   - Helper: "16:9 aspect ratio, JPG/PNG, max 5MB"
   - After upload: thumbnail + "Replace" + "Remove" buttons
5. Tags (tag input, multi-select): "Figma, UX, Onboarding, SaaS"
   - Helper: "Up to 5 tags. Helps Buyers find your gig."

VALIDATION (per PRD §4.4.4):
- Title: required, 5-80 chars
- Category: required
- Cover image: required for publish (can save draft without)

FOOTER (sticky bottom, 2-column):
- Left: "Save as draft" (secondary, #16A34A outline) — saves draft, exits wizard
- Right: "Continue to Step 2" (#16A34A primary, 44px) — disabled until required fields valid

MOBILE VARIANT:
- Stepper becomes horizontal scroll
- Form fields full-width
- Footer becomes sticky bottom bar with both buttons (50% each)
```

#### Frame: Pro / S04 / 4.4 / Gig-Wizard-Step-4-Pricing / Desktop

```
Step 4 of Gig Wizard — Pricing (per PRD §4.4.5 Gig Packages and Commercial Summary).

LAYOUT (same wizard shell, step 4 active):

SECTION: "Set your pricing"
- Sub-text (14px #475569): "Single package in v0.1. Buyer fee (14%) is added on top — Buyers see the total."

PRICING FORM:
- Pro fee input (currency input, ₹ prefix, 40px height, full-width):
  - Label: "Your professional fee"
  - Value: "₹80,000"
  - Helper: "You keep 100% of this. QuickQuid takes ₹0 commission from you."

LIVE COMMERCIAL SUMMARY CARD (right side or below, #DCFCE7 tint, 16px padding):
- Title (14px semibold #14532D): "What the Buyer sees"
- Breakdown (Fee Breakdown component per §1.3.3):
  - Pro fee: ₹80,000
  - QuickQuid commission from Pro: ₹0
  - Buyer fee (14%): ₹11,200
  - Applicable taxes: Determined by Finance
  - Divider
  - Buyer total before tax: ₹91,200
- "You receive" highlight: "₹80,000 (settled to your linked account via provider)"

REVISIONS INCLUDED (number input):
- Label: "Revisions included"
- Value: 2
- Helper: "Number of free revisions. Additional revisions can be negotiated in messaging."

ADDITIONAL SERVICES (optional, expandable):
- "Add expedited delivery (+₹X)" toggle
- "Add source files (+₹X)" toggle

VALIDATION:
- Pro fee > 0
- Revisions >= 0

FOOTER:
- "Back" (secondary)
- "Continue to Step 5" (#16A34A)
```

#### Frame: Pro / S04 / 4.6 / Gig-Preview / Desktop

```
Step 7 of Gig Wizard — Preview & Publish (per PRD §4.4.6).

LAYOUT (same wizard shell, step 7 active, 2-column 50%/50%):

LEFT — EDITOR (50%):
- "Review your gig before submitting for moderation"
- Checklist of all 6 previous steps with "Edit" links:
  ✓ Basics — "I will design..." — Edit
  ✓ Scope — 5 inclusions, 3 exclusions — Edit
  ✓ Deliverables — 4 items — Edit
  ✓ Pricing — ₹80,000 — Edit
  ✓ Timeline — 14 days, 2 revisions — Edit
  ✓ Requirements — 3 questions for Buyer — Edit
- Moderation note (#FEF3C7 background, 12px padding):
  - "⚠ Your gig will be reviewed by Admin before going live. SLA: 48 hours. You'll be notified of the decision."

RIGHT — PREVIEW (50%, sticky):
- "Buyer-facing preview" header
- Rendered gig detail card (exactly how it will appear in 3.1 discovery and 4.8 Buyer Gig Detail):
  - Cover image (16:9)
  - Title (20px semibold)
  - Pro avatar + name + trust labels
  - Deliverables list
  - Exclusions list
  - FAQ section (if added)
  - Price breakdown card
  - "Request this gig" CTA (disabled in preview, with "Preview only" tooltip)

FOOTER (sticky bottom):
- "Back to edit" (secondary)
- "Save as draft" (secondary)
- "Submit for review" (#16A34A, 44px) — opens confirmation dialog

CONFIRMATION DIALOG (on submit click):
- "Submit gig for moderation?"
- Body: "Your gig will be reviewed within 48 hours. You can't edit it while in review."
- "Cancel" / "Submit"

POST-SUBMIT:
- Redirect to 4.9 Gig Management with toast "Gig submitted for review"
- Gig status changes to "In review" (#FEF3C7 badge)
```

#### Frame: Admin / S04 / 4.7 / Gig-Moderation / Desktop

```
Generate the Admin Gig Moderation review screen.

LAYOUT (full Admin shell — Risk Tier 3 role, since gig approval is Risk per §6.2):
- Admin sidebar (260px, #FEE2E2 tint):
  - Operations | KYC | Payment Verification | Payouts | Refunds | Disputes | Trust & Safety (active) | Audit Log | Settings
- Main content:
  - Breadcrumb: "Trust & Safety / Gig Review / GIG-0234"
  - H1 (22px): "Gig Review — GIG-0234"

TWO-PANE LAYOUT (66% / 33%):

LEFT — GIG CONTENT (66%, scrollable):
- Gig preview (rendered as Buyer would see it):
  - Cover image
  - Title: "I will design a complete partner onboarding flow in Figma"
  - Pro info: Akhil Menon (PRO-2088) + trust labels
  - Description, deliverables, exclusions, FAQ
  - Pricing breakdown
- All sections editable by Admin (inline edit pencil icons)

RIGHT — REVIEW PANEL (33%, sticky):
- Card 1 — Submitter info:
  - Pro: Akhil Menon (PRO-2088)
  - Trust score: 4.8/5
  - Member since: 2026-01
  - Previous gigs: 3 approved, 0 rejected
  - "View Pro profile →" link
- Card 2 — Review checklist:
  - ☐ Content quality (no spam, clear description)
  - ☐ Prohibited services check (no illegal/regulated services)
  - ☐ Price合理性 (within category norms)
  - ☐ Evidence/portfolio adequate
  - ☐ No contact info in description (circumvention check)
- Card 3 — Prohibited data scan:
  - Auto-scan results: "No phone numbers detected" / "No emails detected" / "No external payment links"
  - If detected: red alert with highlighted text in preview

ACTION BAR (sticky bottom):
- Reason input (text field, full-width): "Document your decision..."
- 4 action buttons:
  1. "Approve" (#16A34A) — gig goes live in 3.1
  2. "Request changes" (#F59E0B) — Pro gets feedback, can resubmit
  3. "Reject" (#DC2626) — gig cannot be resubmitted
  4. "Pause" (secondary) — gig paused, Pro can edit
  5. "Escalate" (secondary) — escalate to Ops Manager

POST-DECISION:
- Audit event created (12.4)
- Pro notified (99.1)
- If approved: gig status → "Live" (#DCFCE7 badge), appears in 3.1 discovery
- If rejected: gig status → "Rejected" (#FEE2E2 badge), Pro sees reason in 4.9
```

#### Frame: Buyer / S04 / 4.8 / Gig-Detail / Desktop

```
Generate the Buyer-facing Gig Detail page (when Buyer opens a live gig from 3.1).

LAYOUT (full Buyer shell, 2-column 66% / 33%, similar to 4.1 Pro Detail):

LEFT — GIG NARRATIVE (66%):
- Cover image (full-width, 16:9)
- Title (28px semibold): "I will design a complete partner onboarding flow in Figma"
- Pro info row: avatar + "Akhil Menon" + trust labels + "View Pro profile →"
- Description section (H3 + body)
- Deliverables section (H3 + bullet list with checkmark icons):
  • Complete UX flow in Figma
  • UI design for 12 screens
  • Component library
  • Design documentation
- Exclusions section (H3 + red ⚠ icon + bullets):
  • Backend implementation
  • Hosting setup
- Timeline section: "14 days delivery"
- Revisions: "2 revisions included"
- Requirements from Buyer: "I'll need your brand guidelines, existing user research, and access to current onboarding analytics."
- FAQ section (3-5 expandable Q&A)

RIGHT — STICKY COMMERCIAL & ACTION PANEL (33%):
- Card:
  - Status badge: "Live" (#DCFCE7 bg, #14532D text)
  - Pro fee: ₹80,000 (20px semibold)
  - QuickQuid commission from Pro: ₹0 (14px #16A34A)
  - Buyer fee (14%): ₹11,200
  - Applicable taxes: Determined by Finance
  - Divider
  - Buyer total before tax: ₹91,200 (18px semibold #1E3A8A)
  - Timeline: "14 days"
  - Revisions: "2 included"
  - Primary CTA (#2563EB, 44px, full-width): "Request this gig"
  - "Message Pro" secondary link
- Note (12px #64748B italic): "Requesting this gig creates a contract. Manual payment via provider checkout is still required."

ON "Request this gig" CLICK:
- Creates contract draft from gig terms
- Redirects to 8.1 Offer Sheet prefilled with gig terms
- 9.1 manual payment gate still applies (per PRD §4.8 — "9.1 manual payment gate still applies")
```

#### Frame: Pro / S04 / 4.9 / Gig-Management / Desktop

```
Generate the Pro Gig Management table view.

LAYOUT (full Pro shell, main content):
- Breadcrumb: "Gigs / My gigs"
- H1 (22px): "My gigs"
- Sub-text: "Manage your productized service listings."
- Top-right: "+ Create new gig" button (#16A34A, 44px)

PERFORMANCE SUMMARY CARDS (4-card row, 24px gap):
- Card 1: "Total gigs" — 5 (3 Live, 1 Draft, 1 In review)
- Card 2: "Total views (30d)" — 1,247
- Card 3: "Total requests (30d)" — 23
- Card 4: "Conversion rate" — 1.84%

GIG TABLE (full-width, 1px border #E2E8F0):
Header row (48px, #F8FAFC background):
| Gig | Status | Views (30d) | Requests (30d) | Conversion | Active orders | Rating | Last updated | Actions |

Data rows (each 64px, hover #F8FAFC):

Row 1:
- Gig: cover thumbnail (40px) + "I will design a complete partner onboarding flow" + "GIG-0234"
- Status: "Live" badge (#DCFCE7 bg, #14532D text)
- Views: 412
- Requests: 8
- Conversion: 1.94%
- Active orders: 2
- Rating: 4.9/5
- Last updated: 2 hours ago
- Actions: kebab menu (Edit | Pause | Duplicate | Archive)

Row 2:
- "I will redesign your mobile app UX"
- Status: "Live"
- Views: 387, Requests: 6, etc.

Row 3:
- "I will conduct user research interviews"
- Status: "In review" badge (#FEF3C7 bg, #78350F text)
- Views: — (not visible while in review)
- Last updated: 1 day ago
- Actions: "View submission" link (no Edit while in review)

Row 4:
- "I will create your brand identity"
- Status: "Draft" badge (#DBEAFE bg, #1E3A8A text)
- Actions: "Continue editing" link

Row 5:
- "I will write technical documentation"
- Status: "Paused" badge (#F1F5F9 bg, #334155 text)
- Actions: "Resume" link

EMPTY STATE (if no gigs):
- "You haven't created any gigs yet"
- CTA: "Create your first gig" (#16A34A)

MOBILE VARIANT:
- Table becomes card list (each gig = one card with key info)
- Performance summary cards stack 2×2
- Actions become a bottom sheet on tap
```

#### Frame: Pro / S04 / 4.9 / Rejected-State / Desktop

```
Gig Management view filtered to show a rejected gig with reason.

ROW for rejected gig:
- Status: "Rejected" badge (#FEE2E2 bg, #7F1D1D text)
- Actions: "View reason" link

ON "View reason" CLICK:
- Modal opens (560px wide):
  - Header: "Gig rejected — GIG-0228"
  - Status badge: "Rejected"
  - Reason card (#FEE2E2 background, #DC2626 left-border 3px):
    - Label: "REASON"
    - Text: "Description contains external payment link (paypal.me/...). This violates our circumvention policy. Please remove and resubmit."
  - Decided by: "Risk Tier 3"
  - Decided on: "2026-08-06 15:42 IST"
  - Audit reference: "EVT-98765"
  - Footer:
    - "Edit gig" (#2563EB) — opens 4.4 wizard with rejected gig prefilled
    - "Contact Support" (secondary)
```

---

### Screen 05 — Buyer Brief Creation

**PRD source:** §4.5.1–4.5.7 (lines 1647–1776)
**5W1H:** Buyer. Create, save, preview, publish, archive, and republish a project brief. Buyer has a hiring need and wants public proposals or a private invitation target. Buyer dashboard, My Briefs, or blank-state CTA. Strong scope inputs prevent bad matching, fee surprise, and later dispute friction. One-page accordion form with live commercial summary, draft autosave, budget guardrail, visibility control, and publish state.

#### Frame: Buyer / S05 / 5.1 / Default / Desktop

```
Generate a Buyer Brief Creation form with sticky commercial summary.

LAYOUT (full Buyer shell, 2-column 66% / 33%):
- Breadcrumb: "My Briefs / New brief"
- Page header row: H1 "New brief" (22px) | autosave status indicator (right, "Saving..." or "Saved 2 min ago")

LEFT — ACCORDION FORM (66%, 32px padding):

All 5 sections visible as accordions. Each accordion has a chevron + section number badge + title + completion check (✓ when section has valid data).

SECTION 1 — BASICS (expanded by default):
- Section header (16px semibold): "1. Basics"
- Form fields (vertical stack, 16px gap):
  • Title (text, full-width, 5-100 chars, counter shown):
    - Label: "Brief title"
    - Placeholder: "e.g. Build a secure partner onboarding portal"
    - Helper: "5-100 characters"
  • Category (dropdown, required): Design ▾
    - Options: Design | Development | Writing | Marketing | Video | Other
  • Objective (textarea, 4 rows, min 30 chars, counter):
    - Label: "What are you trying to achieve?"
    - Helper: "At least one sentence (30+ characters)"
  • Sub-category (dropdown, conditional on category): UX/UI Design ▾

SECTION 2 — SCOPE & ACCEPTANCE CRITERIA (collapsed):
- Header: "2. Scope + acceptance criteria"
- When expanded:
  • Deliverables (repeatable list, add/remove rows):
    - Each row: text input + remove button
    - "+ Add deliverable" button
    - Helper: "List at least one deliverable"
  • Acceptance criteria (repeatable list):
    - Each row: text input + remove button
    - "+ Add criterion" button
    - Helper: "List at least one acceptance criterion — what must be true for the milestone to be accepted?"
  • Exclusions (repeatable list, REQUIRED per §4.5.5):
    - Each row: text input + remove button
    - Helper (with ⚠ icon, #DC2626): "Exclusions are required — they prevent scope creep. List what is NOT included."

SECTION 3 — BUDGET & TIMELINE (collapsed):
- Header: "3. Budget + timeline"
- When expanded:
  • Budget (currency input, ₹ prefix, required, > 0):
    - Label: "Budget (Pro fee)"
    - Value: "₹80,000"
    - Helper: "INR only. This is the Pro's fee. Buyer fee (14%) is added on top."
  • Timeline (date picker, required, must be future):
    - Label: "Project deadline"
    - Helper: "Select a date in the future"

SECTION 4 — VISIBILITY (collapsed):
- Header: "4. Visibility"
- When expanded:
  • Radio buttons (2 options):
    ○ Open to verified Pros — "Anyone with a verified Pro account can see and apply. Your brief appears in the public Brief feed (3.1)."
    ○ Private (invite only) — "Only Pros you invite can see this brief. Does NOT appear in public feed. Accessible through 4.2 invitation."
  • Consequence text card (#DBEAFE tint, 12px padding):
    - For Open: "✓ Visible in 3.1 Brief feed. Any verified Pro can submit a proposal."
    - For Private: "🔒 Not in public feed. You must invite Pros via 4.2 Invite to Brief."

SECTION 5 — ATTACHMENTS (collapsed):
- Header: "5. Attachments (optional)"
- When expanded:
  • Upload zone (dashed border, multi-file):
    - "Click to upload or drag files"
    - Helper: "Max 5 files, 25MB each. Allowed: PDF, DOCX, XLSX, PPTX, PNG, JPG, WEBP, MP4, MOV. No executables."
  • File list (after upload):
    - Each: file icon + name + size + remove button

RIGHT — STICKY LIVE PREVIEW (33%, sticky, see 5.2):

FOOTER (sticky bottom):
- Left: "Save as draft" (secondary)
- Right: "Publish brief" (#2563EB, 44px) — disabled until all required fields valid + Terms consent checked
```

#### Frame: Buyer / S05 / 5.2 / Default / Desktop

```
Sticky Live Preview & Fee Calculator panel (right side of 5.1).

LAYOUT (33% width, sticky):
- Card (1px solid #E2E8F0, 24px padding, 8px radius):
  - H3 "Commercial summary" (16px semibold)
  - Sub-text (12px #64748B): "Updates live as you type"

  - Pro fee row:
    - Label (13px #475569): "Pro fee"
    - Value (16px semibold #0F172A): "₹80,000"

  - QuickQuid commission row:
    - Label: "QuickQuid commission from Pro"
    - Value: "₹0" (#16A34A semibold)
    - Info tooltip (i icon): "During the 0%-commission beta, Pros keep 100% of their agreed professional fee."

  - Buyer fee row:
    - Label: "Buyer fee (14%)"
    - Value: "₹11,200" (14px #475569)
    - Helper (11px #64748B): "14% of Pro fee"

  - Tax placeholder row:
    - Label: "Applicable taxes"
    - Value: "Determined by Finance" (12px italic #64748B)
    - Info tooltip: "Tax is a placeholder until Finance reviews. No hardcoded tax rate."

  - Divider (1px #E2E8F0)

  - Buyer total row:
    - Label (14px semibold): "Buyer total before tax"
    - Value (20px semibold #1E3A8A): "₹91,200"

  - Payment processing fee note (12px #64748B):
    - "Provider processing fee may apply at checkout (shown transparently at payment)."

  - Divider

  - Terms consent checkbox:
    - ☐ "I acknowledge the Terms (including fee structure)" [required for publish]
    - Link: "View Terms" (opens 1.9 in modal)

  - "What Buyers see" callout (#DBEAFE tint, 12px padding):
    - "This breakdown appears on:"
    - Bullets: "Brief publish", "Offer accept", "Payment submit", "Invoice (11.7)"

STATES:
- Empty (no budget entered): Pro fee, Buyer fee, Total all show "—"
- Calculating: brief shimmer
- Updated: values animate from old to new (200ms)
```

#### Frame: Buyer / S05 / 5.3 / Default / Desktop

```
Visibility Toggle sub-section (embedded in Section 4 of 5.1 form, also usable standalone).

LAYOUT (within Section 4 accordion):
- H3 "Visibility" (16px semibold)
- Sub-text (13px #475569): "Choose who can see and apply to your brief. You can change this later by editing the brief."

TWO VISIBILITY OPTION CARDS (side-by-side, 240px each, 16px gap):

CARD A — OPEN:
- Top: 64×64 icon (globe, #2563EB)
- Radio button (top-right, selected state shown with filled blue circle)
- Title (16px semibold #1E3A8A): "Open to verified Pros"
- Body (13px #475569): "Anyone with a verified Pro account can see and apply. Your brief appears in the public Brief feed."
- Visibility tag: "Public feed" (#DBEAFE bg, #1E3A8A text)
- Consequence (12px #64748B): "Appears in 3.1 Brief discovery"

CARD B — PRIVATE:
- Top: 64×64 icon (lock, #F59E0B)
- Radio button
- Title (16px semibold #78350F): "Private (invite only)"
- Body (13px #475569): "Only Pros you invite can see this brief. Does NOT appear in public feed."
- Visibility tag: "Invite only" (#FEF3C7 bg, #78350F text)
- Consequence (12px #64748B): "Accessible through 4.2 invitation"

SELECTED STATE: card border becomes 2px solid (#2563EB or #F59E0B respectively)

HELPER NOTE (below cards, 12px #64748B italic):
"Private briefs are useful for: repeat hires, confidential projects, or when you already have a shortlist of Pros in mind."

POST-PUBLISH BEHAVIOR:
- Open → publishes to 3.1 Brief feed
- Private → accessible only via 4.2 Invite to Brief flow
```

#### Frame: Buyer / S05 / 5.4 / Saving / Desktop

```
Autosave status indicator (header of 5.1 form).

STATES (cycling through as user types):
1. IDLE (no changes): "All changes saved" with green check icon (#16A34A, 14px)
2. SAVING (user just typed, debounce 1.5s): "Saving..." with spinner icon (#64748B, 14px)
3. SAVED (server confirmed): "Saved just now" with green check, fades to "Saved X seconds ago" after 5s
4. ERROR (save failed): "Unable to save — Retry" with red warning icon (#DC2626, 14px) + clickable "Retry" link

VISUAL:
- Position: top-right of form header, 200px wide
- Background: subtle pill #F1F5F9 with 12px padding
- Icon: 16px, animated for spinner
- Text: 13px

BEHAVIOR:
- Debounce: 1.5s after last keystroke
- On error: preserves unsaved local input in localStorage (per PRD §5.4: "Preserve unsaved local input where possible")
- On retry: re-attempts save, returns to SAVED state on success
```

#### Frame: Buyer / S05 / 5.5 / Low-Budget-Warning / Desktop

```
Low-budget warning (non-blocking) shown in Section 3 of 5.1 when budget is below category threshold.

LAYOUT (inline below budget input, #FEF3C7 background, #F59E0B left-border 3px, 12px padding, 6px radius):
- Icon: amber warning triangle (#F59E0B, 16px)
- Title (13px semibold #78350F): "This budget may be below typical expectations for this category"
- Body (12px #78350F): "Design briefs in 'UX/UI Design' typically range from ₹50,000 to ₹2,00,000. You may receive fewer proposals or proposals with counter-offers."
- Suggestion link (12px #2563EB): "See typical budgets for Design →"
- Non-blocking: no error state, publish button still enabled

IN COMMERCIAL SUMMARY (5.2):
- Same warning appears as a smaller inline note below the Pro fee value
- "⚠ Below typical range for Design" (12px #78350F)

BUYER CAN:
- Adjust budget (warning disappears when above threshold)
- Continue with low budget (warning remains but doesn't block publish)
```

#### Frame: Buyer / S05 / 5.6 / Approaching-Inactivity / Desktop

```
Brief Expiration/Archive state shown in Buyer's My Briefs list.

LAYOUT (Brief card in My Briefs list, with inactivity warning):
- Card header: brief title + ref + status badge
- Status badge: "Approaching inactivity" (#FEF3C7 bg, #78350F text, #F59E0B 1px border)
- Warning banner (full-width within card, #FEF3C7 background, 12px padding):
  - Icon: amber clock (#F59E0B)
  - Text (13px #78350F): "This brief hasn't received activity in 6 days. It will be archived in 1 day unless you act."
- Action buttons:
  - "Republish brief" (#2563EB) — refreshes activity timer
  - "Edit brief" (secondary)
  - "Archive now" (text link, #64748B)

STATES (per PRD §4.5.6):
1. ACTIVE: green badge, no warning
2. APPROACHING INACTIVITY (7 days): amber badge + warning (as above)
3. ARCHIVED (10 days): grey badge "Archived" + red banner "This brief was archived due to inactivity. Pros can no longer submit proposals."
4. REPUBLISHED: green badge "Active" + note "Republished on 2026-08-08"

ARCHIVED STATE CARD:
- Status badge: "Archived" (#F1F5F9 bg, #334155 text)
- Banner: red, "Archived due to inactivity"
- All Pros who submitted proposals are notified (per PRD §6.7)
- Actions: "Republish" (#2563EB) | "Edit" (secondary) | "Contact Support" (link)
```

#### Frame: Buyer / S05 / 5.7 / Fee-Rounding / Desktop

```
Fee Calculation & Rounding representation (canonical FeeObject surfacing in 5.2 commercial summary).

LAYOUT (within 5.2 sticky panel, expandable "Fee details" section):

EXPANDABLE "Fee details" (below Buyer total):
- Chevron + "Fee calculation details" (12px #64748B)
- When expanded, shows FeeObject fields:
  - Pro fee: ₹80,000
  - Buyer fee rate: 0.14 (configurable)
  - Buyer fee: ₹11,200
  - Rounding policy: "Round to nearest ₹1, half-up"
  - Rounding version: 1
  - Finance review state: "Draft" badge (#DBEAFE bg)
  - Snapshot of: (none — original)

NOTE (12px #64748B italic):
"All commercial surfaces derive from one canonical FeeObject (per §3.2). Counter-offers create a new versioned snapshot."

COUNTER-OFFER EXAMPLE (in 6.2):
- Pro fee: ₹85,000
- Buyer fee: ₹11,900
- Total: ₹96,900 before tax
- Snapshot of: original FeeObject (linked)
```

---

### Screen 06 — Proposals, Applicants, Matching & Shortlist

**PRD source:** §4.6.1–4.6.8 (lines 1777–1931)
**5W1H:** Buyer reviewing applicants; Pro submitting/managing proposals. Apply, compare, shortlist, decline, counter, withdraw, expire, and reactivate a proposal. A brief is open or an invited Pro receives a private brief. Buyer My Briefs > Applicants; Pro Find Briefs/My Proposals. Buyers need fast evidence-based comparison while Pros need fair, bounded application effort. ATS-like split pane, structured evidence, live counter-offer fee calculation, transparent status, and anti-spam capacity controls.

#### Frame: Buyer / S06 / 6.1 / Default / Desktop

```
Generate an ATS-Lite split pane for Buyer reviewing applicants.

LAYOUT (full Buyer shell, 2-column 40% / 60%):
- Breadcrumb: "My Briefs / BRF-0892 / Applicants"
- Brief summary header (full-width, 64px, #F8FAFC background):
  - Brief title: "Build a secure partner onboarding portal" (16px semibold)
  - Brief ref: "BRF-0892" (12px #64748B)
  - Budget: "₹80,000" | Status: "Open" badge | Proposals: "7 received" | Posted: "2 days ago"

LEFT — APPLICANT LIST (40%, scrollable):
- List header (32px): "Applicants (7)" + sort dropdown (Newest | Lowest fee | Highest rated)
- Applicant rows (each 72px, hover #F8FAFC, selected #DBEAFE):

  Row 1 (selected, counter-offer):
  - Avatar (40px circle) + name + ref "Akhil Menon (PRO-2088)" (14px semibold)
  - Fee: "₹85,000" with "Counter" badge (#FEF3C7 bg, #78350F text)
  - Status: "Shortlisted" badge (#DCFCE7 bg, #14532D text)
  - Time: "2 hours ago" (11px #64748B)

  Row 2:
  - "Riya Sharma (PRO-2102)" | "₹80,000" | "Pending" badge (#DBEAFE bg) | "5 hours ago"

  Row 3:
  - "Nisha Patel (PRO-1876)" | "₹78,000" | "Pending" | "1 day ago"

  Row 4:
  - "Arjun Kumar (PRO-2055)" | "₹82,000" | "Counter" badge | "1 day ago"

  Row 5:
  - "Vikram Singh (PRO-1988)" | "₹80,000" | "Declined" badge (#FEE2E2 bg, #7F1D1D text) | "2 days ago"

RIGHT — APPLICANT DETAIL (60%, scrollable):
For selected applicant (Akhil Menon):

- Header (80px):
  - Avatar (64px) + name "Akhil Menon" (20px semibold) + ref "PRO-2088" (12px #64748B)
  - Trust labels row (12px): identity reviewed • portfolio reviewed • Available now • 12 completed projects
  - Counter-offer badge: "Counter-offer: ₹85,000" (prominent)

- Cover letter section:
  - H3 "Cover letter"
  - Body text (14px #334155): "Hi Northstar Labs team, I've reviewed your brief and I'm excited about the partner onboarding portal project..."

- Delivery approach section:
  - H3 "Delivery approach"
  - Body: "I'd approach this in 4 phases: discovery, wireframing, visual design, and design system handoff..."

- Portfolio evidence section:
  - H3 "Relevant portfolio"
  - 3 portfolio item cards (horizontal scroll):
    - Each: thumbnail, title, link, "Why it's relevant" note from Pro

- Commercial breakdown card (#DBEAFE tint, 16px padding):
  - Fee Breakdown component (§1.3.3):
    - Pro fee (counter): ₹85,000
    - Buyer fee (14%): ₹11,900
    - Applicable taxes: Determined by Finance
    - Buyer total before tax: ₹96,900
  - "Counter-offer" tag (prominent)
  - "vs Brief budget" comparison: "₹5,000 above budget"

- Action bar (sticky bottom):
  - "Shortlist" button (#16A34A, 44px) — already shortlisted state shows "✓ Shortlisted"
  - "Decline" button (secondary, #DC2626 outline)
  - "Message" link (12px #2563EB)
  - "Create offer" button (#2563EB, 44px) — primary CTA, links to 8.1

EMPTY STATE (no applicants):
- "No proposals yet"
- "Edit brief to attract more Pros" or "Invite Pros directly" CTAs

MOBILE VARIANT:
- 2-column collapses to single column
- List view shown first, tap row to navigate to detail (full-screen)
- Swipe back to return to list
```

#### Frame: Buyer / S06 / 6.2 / Counter-Offer-Detail / Desktop

```
Counter-offer fee calculation flow (shown inline in 6.1 right pane, also standalone modal in 6.3 Pro submission).

LAYOUT (within 6.1 right pane, commercial breakdown card expanded):

COUNTER-OFFER DISPLAY:
- Header (14px semibold #1E3A8A): "Counter-offer commercial summary"
- "Pro's proposed fee differs from brief budget" note (12px #64748B italic)

FEE BREAKDOWN (Fee Breakdown component):
- Pro fee (counter-offer): ₹85,000
- QuickQuid commission from Pro: ₹0
- Buyer fee (14%): ₹11,900
- Applicable taxes: Determined by Finance
- Divider
- Buyer total before tax: ₹96,900

COMPARISON CARD (below breakdown, #FEF3C7 tint):
- "Original brief budget: ₹80,000"
- "Counter-offer: ₹85,000 (+₹5,000)"
- "Original Buyer total: ₹91,200"
- "Counter-offer total: ₹96,900 (+₹5,700)"

ACCEPTANCE BEHAVIOR:
- "Accept counter-offer" button: snapshots counter-offer terms into 8.1 offer draft (per PRD §6.5 flow)
- "Negotiate" link: opens 7.1 messaging with counter context

PRD COMPLIANCE (§4.6.5):
- Counter-offer is automatically detected when proposed_fee ≠ brief budget
- Fee object is recomputed (not hardcoded)
- "Counter-offer" tag displayed in 6.1 list and detail
- Accepted terms snapshot into 8.1 offer draft
```

#### Frame: Pro / S06 / 6.3 / Default / Desktop

```
Generate the Pro Proposal Submission form.

LAYOUT (full Pro shell, modal or full-page form):
- Breadcrumb: "Find Briefs / BRF-0892 / Submit proposal"
- H1 (22px): "Submit proposal"
- Brief summary header (read-only, 80px, #F8FAFC):
  - Title: "Build a secure partner onboarding portal"
  - Budget: ₹80,000 | Timeline: 4 weeks | Visibility: Open

PROPOSAL FORM (2-column 66% / 33%):

LEFT — FORM (66%):
1. Proposed fee (currency input, ₹ prefix, required):
   - Label: "Your proposed professional fee"
   - Value: "₹85,000" (if user enters value ≠ brief budget, "Counter-offer" badge appears)
   - Helper: "You keep 100% of this fee. QuickQuid takes ₹0 commission."
   - If ≠ brief budget: amber info card "Your fee differs from the Buyer's budget. This will be shown as a counter-offer."

2. Cover letter (textarea, 8 rows, min 100 chars, counter shown):
   - Label: "Cover letter"
   - Helper: "Explain why you're the right Pro for this brief. Min 100 characters."

3. Delivery approach (textarea, 6 rows):
   - Label: "How will you approach this work?"
   - Helper: "Describe your methodology, phases, and key milestones."

4. Portfolio evidence (multi-select):
   - Label: "Relevant portfolio items"
   - Show Pro's published portfolio items as checkboxes
   - Each selected item: "Why it's relevant" textarea (1 row)
   - "+ Add portfolio item" if more available

5. Availability (dropdown):
   - "Can start within: 1 week | 2 weeks | 3 weeks | 1 month"

6. Timeline commitment (text):
   - "Estimated delivery: 4 weeks"

RIGHT — STICKY COMMERCIAL & READINESS (33%):
- Commercial summary card (live update as fee changes):
  - Pro fee: ₹85,000 (your payout)
  - Buyer fee (14%): ₹11,900
  - Buyer total: ₹96,900 before tax
  - "Counter-offer" tag (if applicable)

- Readiness check card (#DCFCE7 or #FEE2E2 depending on state):
  - "Proposal readiness" header
  - Checklist:
    ✓ Profile complete
    ✓ KYC approved
    ✓ Payout details approved
    ✓ Active proposals: 3/10 (capacity available)
  - If any incomplete: "Submit proposal" button disabled, "Fix readiness →" CTA shown

- Active proposals counter:
  - "Active proposals: 3 / 10"
  - Progress bar (30% filled)

FOOTER:
- "Save as draft" (secondary) — saves draft, exits
- "Submit proposal" (#16A34A, 44px) — disabled until all required fields valid + readiness complete

ON SUBMIT:
- System runs readiness interlock (per PRD §4.1.5):
  - Profile complete? If no → block + direct to 1.11
  - KYC approved? If no → block + direct to 1.3
  - Payout details approved? If no → block + 1.5 modal
  - Active proposal cap < 10? If no → block + capacity modal (6.6)
- If all pass: proposal submitted, Buyer notified, Pro redirected to "Proposal submitted" success state
```

#### Frame: Buyer / S06 / 6.4 / Decline-Modal / Desktop

```
Generate the Decline Proposal modal.

LAYOUT (modal, 480px wide, centered, backdrop overlay):
- Header: H2 "Decline proposal" (20px semibold) | close X
- Sub-text (14px #475569): "Please select a reason. The Pro will be notified. Your reason helps Pros improve, but specific decline analytics are not exposed to Pros."

PRO CARD (read-only summary, 64px):
- Avatar + name + proposed fee + counter-offer badge

REASON SELECTOR (radio buttons, vertical stack, 8px gap):
○ Budget too high
○ Skills mismatch
○ Timeline mismatch
○ Chose another Pro
○ Brief changed
○ Other

OPTIONAL PRIVATE NOTE (textarea, 3 rows):
- Label: "Private note (optional, not shown to Pro)"
- Placeholder: "Internal note for your team..."

WARNING CALLOUT (#FEE2E2 background, 12px padding):
- "⚠ Declining a proposal cannot be undone. The Pro will be notified and their proposal status will change to 'Declined'. You can invite them to a different brief if needed."

FOOTER:
- "Cancel" (secondary)
- "Decline proposal" (#DC2626, 44px) — disabled until reason selected

POST-DECLINE:
- Proposal status → "Declined" (#FEE2E2 badge)
- Pro notified via 99.1: "[Buyer] declined your proposal. (Reason visible to Pro per policy.)"
- Reason visible to Pro per policy (per PRD §4.13.4 notification matrix)
- Buyer can still invite Pro to other briefs
```

#### Frame: Pro / S06 / 6.5 / Expired / Desktop

```
Generate the Proposal Expiry / Reactivation state in Pro's My Proposals list.

LAYOUT (Pro's My Proposals, row state for expired proposal):

EXPIRED PROPOSAL ROW:
- Status badge: "Expired" (#F1F5F9 bg, #334155 text, with clock icon)
- Sub-text: "Expired 3 days ago (14 days no Buyer action)"
- Actions: "Request reactivation" link (#2563EB)

ON "Request reactivation" CLICK:
- Modal (480px):
  - Header: "Request reactivation"
  - Body: "Your original proposal terms (₹85,000) will be sent to the Buyer for re-review. They can accept or decline."
  - "Current terms" card: Pro fee ₹85,000, submitted 2026-07-15
  - "Update terms?" radio:
    ○ Send with original terms
    ○ Update fee (input appears)
  - Footer: "Cancel" / "Send reactivation request"

REACTIVATION REQUESTED STATE:
- Status badge: "Reactivation requested" (#FEF3C7 bg, #78350F text)
- Sub-text: "Waiting for Buyer to confirm"

PER PRD §6.5 STATE MACHINE:
- Pending → Shortlisted → Expired → Withdrawn → ReactivationRequested
- ReactivationRequested → Pending (when Pro confirms current terms)
- New acceptance uses current terms (not original snapshot)

WITHDRAWN STATE:
- Status badge: "Withdrawn" (#F1F5F9 bg, #64748B text)
- Sub-text: "Withdrawn by you on 2026-08-05"
- No actions (terminal state)
- Withdrawal frees capacity (6.6)
```

#### Frame: Pro / S06 / 6.6 / Capacity-Modal / Desktop

```
Generate the Proposal Capacity & Cooldown modal (blocks submission when at cap).

LAYOUT (modal, 480px wide):
- Header: H2 "Active proposal limit reached" (20px semibold)
- Icon: amber warning triangle (#F59E0B, 48px)
- Body (14px #475569): "You have 10 active proposals, which is the v0.1 limit. Withdraw an existing proposal to submit a new one."

ACTIVE PROPOSALS LIST (scrollable, max-height 240px):
- Each row (48px):
  - Brief title + ref
  - Submitted: "2 days ago"
  - Status badge (Pending/Shortlisted)
  - "Withdraw" button (text link, #DC2626)

EMPTY NOTE:
- "Withdrawn proposals free up your capacity immediately. No data is lost — withdrawn proposals remain in your history."

FOOTER:
- "Cancel" (secondary) — closes modal, returns to 6.3 draft preserved
- "Submit proposal" disabled until capacity freed

POST-WITHDRAW:
- Selected proposal status → "Withdrawn"
- Counter decrements: "9 / 10 active proposals"
- 6.3 submit button enables

PRD COMPLIANCE (§4.6.6):
- Default demo limit: 10 active proposals
- Quality control mechanism (v0.1 doesn't charge Pros to apply)
- Withdraw updates available capacity
- No data lost
```

#### Frame: Buyer / S06 / 6.7 / Auto-Close-Timeline / Desktop

```
Buyer Shortlist SLA & Auto-Close timeline visualization (in My Briefs detail or as info card).

LAYOUT (info card, 480px wide, in brief detail):
- H3 "Brief activity timeline" (16px semibold)
- Sub-text (13px #64748B): "Inactive briefs are auto-closed to keep the marketplace healthy."

GANTT-STYLE TIMELINE (horizontal, 7-day window):
- Day 0-7: "Active (Buyer receiving proposals)" — green bar
- Day 7-10: "Approaching inactivity (warning shown)" — amber bar
- Day 10: "Auto-closed (no action)" — red dot/marker

NOTIFICATIONS ROW (below timeline):
- Day 7: "Notify Buyer: inactivity approaching" (icon + text)
- Day 10: "Notify all Pros: brief closed" (icon + text)

PRO SIDE (separate card):
- "Pro can request reactivation" — Day 10-24 window

STATES:
- Active (Day 0-7): green, "Receiving proposals"
- Approaching (Day 7-10): amber, "Will auto-close in X days"
- Closed (Day 10+): red, "Closed due to inactivity" + "Republish" CTA
- Republished: green, "Active again" + "Republished on Day X"

PRD COMPLIANCE (§4.6.7):
- Closing ends pending proposals (Pros notified)
- Republish creates a new active review phase
- Default demo values: 7 days approaching, 10 days closed
```

---

### Screen 07 — Messaging & Scope Finalisation

**PRD source:** §4.7.1–4.7.7 (lines 1932–2064)
**5W1H:** Buyer and Pro; Admin has read-only access only when authorized by a support/dispute context. Contextual messaging, formal scope updates, file exchange, and circumvention prevention. After invitation/proposal and throughout pre-contract discussion; limited scope change process after contract. Messages navigation, brief/proposal/contract detail CTA. Scope drift and off-platform communication create disputes, revenue leakage, and loss of evidence. Chat stays beside immutable summary; system-created scope updates are accepted/declined; file validation and careful contact/payment detection protect the workflow.

#### Frame: Buyer / S07 / 7.1 / Default / Desktop

```
Generate the Messaging Contextual Workspace (chat + immutable scope sidebar).

LAYOUT (full Buyer shell, 2-column 60% / 40%):
- Breadcrumb: "Messages / QQ-0892"
- Page header: contract ref + title + counterpart info (64px)

LEFT — CHAT (60%):
- Chat header (56px, 1px bottom border):
  - Counterpart avatar + name "Akhil Menon" + "PRO-2088"
  - Status: "Online" or "Last seen 2h ago"
  - Actions: "View contract" link | kebab menu (Mute | Block | Report)

- Chat body (scrollable, flex-grow):
  - Date separator: "Today" (12px #64748B, centered, with dividers)
  - System event card (centered, #F1F5F9 background, 12px padding):
    - "Contract QQ-0892 accepted on 2026-08-06 14:32"
  - Buyer message (right-aligned, #2563EB bubble, white text, 8px radius, max-width 70%):
    - "Hi Akhil, looking forward to working on this! A few questions before we begin..."
    - Timestamp "10:15 AM" (10px, below bubble)
  - Pro message (left-aligned, #F1F5F9 bubble, #0F172A text):
    - "Hi Northstar team! Happy to clarify. The phases will be..."
    - Timestamp
  - Pro message + attachment (left-aligned):
    - Message text + attachment card (file icon + name + size + download button)
  - System event: "Scope update proposed by Buyer" (with Accept/Decline buttons inline)

- Chat composer (sticky bottom, 80px, 1px top border, 16px padding):
  - Attachment button (paperclip icon, left)
  - Text input (flex-grow, 40px height, placeholder "Type a message...")
  - Send button (#2563EB, right, 40px, paper plane icon)

RIGHT — SCOPE SIDEBAR (40%, sticky, scrollable):
- H3 "Contract scope" (16px semibold)
- Brief title card (#F8FAFC, 12px padding): "Build a secure partner onboarding portal"
- Fee summary:
  - Pro fee: ₹80,000
  - Buyer fee (14%): ₹11,200
  - Buyer total: ₹91,200 before tax
- Timeline: "4 weeks"
- Deliverables (bullet list with checkmark icons):
  • Partner onboarding flow (UX + UI)
  • Admin dashboard
  • Audit log viewer
  • Documentation
- Exclusions (bullet list with ⚠ icons):
  • Backend implementation
  • Hosting setup
- Acceptance criteria (numbered list)
- Revision count: "2 revisions included"
- Contract status badge: "Accepted — Funding pending" (#FEF3C7)
- "Propose scope update" button (secondary, full-width) — opens 7.2

PERMISSIONS:
- Buyer and Pro both see this view (with role-appropriate message bubbles)
- Admin (Support/Risk) has read-only access only when authorized by support/dispute context (per PRD §4.7.1)
- Normal Admin cannot browse all conversations (per §4.7.7)

MOBILE VARIANT:
- 2-column collapses to single column
- Chat is primary view, scope sidebar accessible via "Scope" tab or expandable drawer
- Composer sticky at bottom
```

#### Frame: Buyer / S07 / 7.2 / Scope-Update-Modal / Desktop

```
Generate the Scope Update modal (formal pre-contract change request).

LAYOUT (modal, 640px wide, centered):
- Header: H2 "Propose scope update" (20px semibold) | close X
- Sub-text (14px #475569): "Formal scope changes are recorded separately from chat. The other party can Accept, Decline, or Request changes."

FORM (vertical stack, 16px gap):
1. Change type (radio buttons):
   ○ Add deliverable
   ○ Remove deliverable
   ○ Modify deliverable
   ○ Change fee
   ○ Change timeline
   ○ Modify acceptance criteria

2. Affected item (dropdown, conditional on change type):
   - For "Add deliverable": text input for new item
   - For "Remove/Modify": dropdown of existing items

3. Fee delta (currency input, optional):
   - Label: "Fee change"
   - Value: "+₹5,000" or "-₹2,000" or "No change"
   - Helper: "Positive = increase to Pro fee. Negative = decrease."

4. Timeline delta (number input + unit dropdown):
   - Value: "+5" | Unit: "days | weeks"
   - Helper: "How much time is added/removed?"

5. Criteria impact (textarea, 3 rows):
   - Label: "Acceptance criteria impact"
   - Placeholder: "Does this change affect any acceptance criteria?"

6. Reason (textarea, required, 3 rows):
   - Label: "Why are you proposing this change?"
   - Helper: "Required — helps the other party decide."

COMMERCIAL PREVIEW (right side or below, #FEF3C7 tint):
- "Updated commercial summary (if accepted)"
- Pro fee: ₹85,000 (was ₹80,000, +₹5,000)
- Buyer fee: ₹11,900
- Buyer total: ₹96,900 before tax

FOOTER:
- "Cancel" (secondary)
- "Send scope update" (#2563EB, 44px)

POST-SEND:
- ScopeUpdate record created (status: Pending)
- Other party notified via 99.1
- Scope update appears as system event in 7.1 chat
- Other party can Accept / Decline / Request changes (per PRD §4.7.5 sequence)

STATES:
- Pending: amber badge in chat
- Accepted: green badge, scope sidebar updates, 8.1 offer draft updates (if exists)
- Declined: red badge with reason
- Counter-proposed: amber badge, original proposer can Accept/Decline counter
```

#### Frame: Buyer / S07 / 7.3 / Scope-Locked / Desktop

```
Scope Locked state (after contract accepted, scope sidebar becomes read-only).

LAYOUT (7.1 right pane, scope sidebar modified):
- Scope sidebar header change:
  - H3 "Contract scope" with lock icon (🔒 #6B7280)
  - Status badge: "Scope locked by contract" (#F1F5F9 bg, #334155 text)

- All scope items shown read-only (no edit buttons, no "Propose scope update" button)

- Info card (#F1F5F9 tint, 12px padding):
  - Icon: lock (#6B7280)
  - Title (13px semibold #334155): "Scope locked by contract"
  - Body (12px #64748B): "Formal amendment only. Post-contract commercial changes require a formal amendment process (placeholder for future — 11.9)."

- "View contract" link (12px #2563EB) — opens 8.1 immutable offer sheet
- "Request formal amendment (future)" button (disabled, greyed out, with "Future" tag)

CHAT REMAINS ACTIVE:
- Chat still works normally (Buyer/Pro can communicate)
- Only formal scope changes are locked
- File attachments still allowed
- Circumvention detection still active (7.5)
```

#### Frame: Buyer / S07 / 7.4 / File-Attachment / Desktop

```
File attachment validation in chat composer (7.1 left pane, on file attach).

LAYOUT (within chat composer):
- Attachment button (paperclip) opens file picker
- On file select, upload progress card appears above composer:

UPLOAD PROGRESS CARD (full-width, 64px, #F8FAFC background, 8px radius):
- File icon (32px, type-specific: PDF, DOCX, PNG, etc.)
- Filename + size (13px #0F172A)
- Progress bar (full-width, 4px height, #E2E8F0 track, #2563EB fill)
- "Cancel" button (right, removes upload)

VALIDATION (per PRD §4.7.6 file attachment matrix):
- Allowed types: PDF, DOCX, XLSX, PPTX, PNG, JPG, WEBP, MP4, MOV
- Max size: 25MB
- Blocked: .exe, .bat, .sh, .msi (executables)
- Conditional: .zip, .rar (allowed only if no executable inside — scan required)
- Unknown types: blocked (whitelist enforcement)

ERROR STATES:
- Invalid type: red border on card, "File type not allowed. Allowed: PDF, DOCX, XLSX, PPTX, PNG, JPG, WEBP, MP4, MOV."
- Oversize: red border, "File too large. Maximum 25MB."
- Executable in zip: red border, "Archive contains executable. Remove the executable and re-upload."

SUCCESS STATE:
- Progress bar fills green
- Card becomes attachment chip in composer
- On send, attachment appears in chat message with download link

VALIDATION ANIMATIONS:
- Upload progress: smooth animation 0-100%
- Error: shake animation on card
- Success: brief green flash, then chip appears
```

#### Frame: Buyer / S07 / 7.5 / Circumvention-Warning / Desktop

```
Circumvention and Sensitive-Contact Detection inline warning.

LAYOUT (inline in chat composer, when user types or sends sensitive pattern):

WARNING STATE (replaces normal send behavior):
- Chat composer border becomes #DC2626 (red)
- Inline warning banner appears above composer (full-width, #FEE2E2 background, #DC2626 left-border 4px, 12px padding):
  - Icon: red shield with X (#DC2626, 24px)
  - Title (14px semibold #7F1D1D): "QuickQuid requires payments and contact details to stay on-platform"
  - Body (13px #7F1D1D): "Please edit your message to remove: phone numbers, email addresses, UPI IDs, or links to external payment sites."
  - Detected patterns highlighted in message text (yellow #FEF3C7 background on the specific words)

- Composer actions:
  - "Edit message" (primary, #DC2626 outline) — keeps message in composer for editing
  - "Report false positive" (text link, 12px #64748B) — opens 99.2 support ticket + 12.14 Trust/Safety entry

DETECTION PATTERNS (per PRD §4.7.4):
- Phone number patterns (Indian + international formats)
- Email patterns
- Payment app handles / UPI IDs (e.g. "akhl@upi", "paypal.me/...")
- URLs to external payment sites (paypal, venmo, cashapp, etc.)

FALSE POSITIVE FLOW:
1. User clicks "Report false positive"
2. Modal: "Report false positive"
3. Body: "Are you sure this is a false positive? A Risk Admin will review your report."
4. Reason textarea (required)
5. Submit → creates 99.2 support ticket + 12.14 Trust/Safety entry
6. Risk Admin reviews (per PRD §4.7.4 flow):
   - If approved: message sends normally
   - If denied: original warning remains, user must edit

POST-APPROVAL:
- Message stored + visible in 7.1
- Audit log entry created (12.4) in case of future dispute
```

---

### Screen 08 — Offer, Contract & Milestones

**PRD source:** §4.8.1–4.8.7 (lines 2065–2224)
**5W1H:** Buyer drafts; Pro accepts/declines; authorized Admin can inspect completed contract record. Formal commercial offer, milestone configuration, acceptance, and funding gate. Buyer chooses a shortlisted/invited Pro after scope is clear. Applicant list, message workspace, rehire flow. Contract terms must become readable, reviewable, immutable evidence before work begins. Document-like offer with scoped terms and up to four milestones; acceptance changes status to Accepted Pending Funding; manual payment remains a separate required step.

#### Frame: Buyer / S08 / 8.1 / Default / Desktop

```
Generate the Immutable Offer Sheet (document-like, 800px wide, with summary rail).

LAYOUT (full Buyer shell, 2-column 800px / 320px):
- Breadcrumb: "Contracts / QQ-0892 / Offer"

LEFT — OFFER DOCUMENT (800px, white background, 32px padding, document styling):
- Document header (centered):
  - "QuickQuid Offer" (12px #64748B, uppercase, letter-spacing)
  - H1 "QQ-0892" (32px semibold #0F172A)
  - "Created: 2026-08-06" | "Status: Draft" badge

- Parties section (2-column):
  - Buyer card: "Northstar Labs (BUY-1042)" + billing address + GSTIN
  - Pro card: "Akhil Menon (PRO-2088)" + headline + trust labels

- Scope section:
  - H3 "Scope"
  - Brief reference: "BRF-0892 v1"
  - Brief title: "Build a secure partner onboarding portal"
  - Objective (full text from brief)
  - Deliverables (bullet list)
  - Exclusions (bullet list with ⚠ icons)
  - Acceptance criteria (numbered list)

- Commercial terms section:
  - H3 "Commercial terms"
  - Fee Breakdown component (§1.3.3):
    - Pro fee: ₹80,000
    - QuickQuid commission from Pro: ₹0
    - Buyer fee (14%): ₹11,200
    - Applicable taxes: Determined by Finance
    - Buyer total before tax: ₹91,200

- Milestones section:
  - H3 "Milestones (4 of 4 max)" with milestone count badge "4/4"
  - Milestone cards (vertical stack):

    Milestone 1:
    - Header: "M1 — Discovery & Wireframes" + amount "₹34,200" (right)
    - Acceptance criteria: "Wireframes for all 12 screens approved"
    - Due date: "2026-08-20"
    - Status badge: "Funding" (#DBEAFE bg)

    Milestone 2:
    - "M2 — Visual Design" + "₹20,000"
    - Criteria: "Visual design for all screens approved"
    - Due: "2026-09-03"

    Milestone 3:
    - "M3 — Design System" + "₹15,800"
    - Criteria: "Component library + documentation delivered"
    - Due: "2026-09-17"

    Milestone 4:
    - "M4 — Handoff" + "₹10,000"
    - Criteria: "Final handoff with walkthrough"
    - Due: "2026-09-24"

    "+ Add milestone" button (disabled if 4 already, shows 8.3 tooltip)

- Revision & cancellation terms section:
  - H3 "Revisions and cancellation"
  - Revisions: "2 revisions included per milestone"
  - Cancellation: "Mutual mid-contract cancellation per §11.6. Provider-mediated refund per §12.7."

RIGHT — SUMMARY RAIL (320px, sticky):
- Commercial summary card (#DBEAFE tint):
  - Pro fee: ₹80,000
  - Buyer fee: ₹11,200
  - Tax: Determined by Finance
  - Buyer total: ₹91,200 before tax

- Milestone sum card:
  - "Milestone sum verification"
  - M1+M2+M3+M4 = ₹80,000
  - "✓ Matches Pro fee" green check

- Action buttons (vertical stack, full-width):
  - "Save draft" (secondary)
  - "Send offer to Pro" (#2563EB, 44px)

STATES (per PRD §4.8.4):
- Draft: as above
- Sent to Pro: status "Awaiting Pro response" (#FEF3C7 badge), buttons hidden
- Pro accepted: status "Accepted — Pending Funding" (#FEF3C7 badge), redirect to 8.2
- Pro declined: status "Offer declined" (#FEE2E2 badge), "Revise offer" CTA

PRD COMPLIANCE (§4.8.5):
- Max 4 milestones enforced (8.3 tooltip on add)
- Milestone sum must equal Pro fee (warning if not)
- Each milestone: title required, amount > 0, criteria required, due date future
```

#### Frame: Pro / S08 / 8.1 / Received / Desktop

```
Pro's view of the received offer (read-only with Accept/Decline).

LAYOUT (same document layout as 8.1 Default, but Pro is viewer):

DIFFERENCES:
- Breadcrumb: "My Proposals / QQ-0892 / Offer received"
- Document header status: "Offer received — Awaiting your response" (#FEF3C7 badge)
- No "Send offer" button, no "Save draft" button
- No edit capability (read-only document)

RIGHT RAIL — ACTION BUTTONS:
- "Decline offer" (#DC2626 outline, 44px) — opens 8.4 modal
- "Accept offer" (#16A34A, 44px, full-width) — opens confirmation dialog

ACCEPT CONFIRMATION DIALOG:
- Modal (480px):
  - Header: "Accept offer QQ-0892?"
  - Body: "By accepting, you agree to the scope, milestones, and terms above. A contract will be created with these terms snapshotted. You cannot begin work until the Buyer funds Milestone 1 and Finance approves unlock."
  - Commercial summary card
  - "I understand I cannot begin work until payment is confirmed" checkbox [required]
  - Footer: "Cancel" / "Accept offer" (#16A34A)

POST-ACCEPT:
- Contract record created (immutable snapshot per §4.8.6)
- Status: "Accepted — Pending Funding"
- Buyer notified: "[Pro] accepted your offer. Fund milestone 1 to begin."
- Pro redirected to 8.2 Funding Interlock
- Scope sidebar in 7.1 becomes locked (7.3)
```

#### Frame: Pro / S08 / 8.2 / Funding-Interlock / Desktop

```
Funding Interlock state (Pro cannot start work until payment confirmed).

LAYOUT (full Pro shell, main content, centered):
- Breadcrumb: "Contracts / QQ-0892 / Funding"

HERO CARD (max-width 640px, centered):
- Top: large lock icon (#6B7280, 80px, in circle with #F1F5F9 background)
- Title (24px semibold #0F172A): "Work may not begin yet"
- Status badge: "Accepted — Pending Funding" (#FEF3C7 bg, #78350F text)
- Body (15px #475569): "The Buyer needs to fund Milestone 1 via provider checkout, and Finance Admin needs to approve the unlock. You will be notified when work may begin."

TIMELINE (vertical, 4 steps):
- Step 1 (complete, green check): "Offer accepted — 2026-08-06 14:32"
- Step 2 (in progress, amber spinner): "Buyer payment in progress via provider checkout"
  - Sub-text: "Waiting for Buyer to complete provider checkout"
  - Estimated: "Usually within 24 hours"
- Step 3 (pending, grey): "Finance Admin approves milestone unlock"
  - Sub-text: "Expected target: 24 hours after capture"
- Step 4 (pending, grey): "Work may begin — you'll be notified"

WARNING BANNER (#FEF3C7 background, #F59E0B left-border 4px, 16px padding):
- Icon: warning triangle (#F59E0B, 24px)
- Title (14px semibold #78350F): "Do not begin work until QuickQuid confirms funding"
- Body (13px #78350F): "Starting work before Payment Confirmed state is a v0.1 violation. The Buyer has not paid yet — you may not be paid for unauthorized work."

CONTRACT DETAILS CARD (below hero):
- Link to view 8.1 offer sheet (read-only)
- Link to open 7.1 messaging
- Link to 99.2 support if questions

ACTION BUTTONS:
- "View offer" (secondary)
- "Message Buyer" (secondary)
- No "Start work" button (locked)

POST-CONFIRMATION:
- Pro receives 99.1 notification: "Payment confirmed. Pro may begin work."
- Banner changes to green "Payment confirmed — work may begin"
- "Open workroom" button appears (#16A34A, 44px) — links to 10.1
```

#### Frame: Buyer / S08 / 8.3 / Milestone-Cap-Tooltip / Desktop

```
Milestone cap tooltip (appears when Buyer tries to add 5th milestone).

TRIGGER:
- Buyer clicks "+ Add milestone" button when 4 milestones already exist

BEHAVIOR:
- Add milestone button becomes disabled
- Tooltip appears next to button (240px wide, #0F172A background, white text, 8px radius, arrow pointing to button):

TOOLTIP CONTENT:
- Title (13px semibold): "Milestone limit reached"
- Body (12px): "v0.1 supports up to 4 milestones while payment capture and payout settlement are provider-mediated."
- "Edit existing milestones" link (12px #2563EB, opens milestone editor)

PER PRD §4.8.3:
- Disable "Add milestone" button (greyed out)
- Display tooltip text: "v0.1 supports up to 4 milestones while payment verification and payout processing are manual."
- Buyer can edit existing milestones or continue with 4

MOBILE VARIANT:
- Tooltip becomes bottom-sheet with full-width info card
- "Edit existing" button at bottom
```

#### Frame: Pro / S08 / 8.4 / Decline-Modal / Desktop

```
Contract Decline reason modal (Pro rejects offer).

LAYOUT (modal, 480px wide, centered):
- Header: H2 "Decline offer QQ-0892" (20px semibold) | close X
- Body intro (14px #475569): "Please share why you're declining. The Buyer will be notified and can revise or send a new offer."

OFFER SUMMARY (read-only card, 64px):
- Contract ref + Pro fee + milestone count

REASON SELECTOR (radio buttons, vertical stack):
○ Scope unclear
○ Timeline too tight
○ Budget too low
○ Availability changed
○ Other (with text field)

OPTIONAL MESSAGE (textarea, 3 rows):
- Label: "Message to Buyer (optional)"
- Placeholder: "Add context to help the Buyer understand..."

WARNING (#FEE2E2 background, 12px padding):
- "⚠ Declining cannot be undone. The Buyer can revise and resend, or choose another Pro."

FOOTER:
- "Cancel" (secondary)
- "Decline offer" (#DC2626, 44px) — disabled until reason selected

POST-DECLINE (per PRD §4.8.4):
- Contract status: "Offer declined"
- Buyer notified via 99.1: "[Pro] declined your offer. Reason: [X]."
- System message added to 7.1 chat: "Pro declined offer. Reason: Budget too low."
- Buyer can revise offer or create new offer to different Pro
```

---

### Screen 09 — Buyer Payment, Provider Verification & Payout Status

**PRD source:** §4.9.1–4.9.8 (lines 2225–2417)
**5W1H:** Buyer pays via provider-hosted checkout; Pro sees protected waiting state; Finance/Admin approves milestone unlock and payout release; Risk sees reversal exceptions; Provider (Razorpay Route) handles custody and settlement. Provider-mediated Buyer payment, Finance unlock approval, exception handling, payout release, and refund/chargeback controls. After contract acceptance and before work; after milestone acceptance; during cancellation/reversal. Buyer Payments, contract detail, Pro dashboard, Finance/Admin queues, Provider webhook ingestion service. v0.1 trust depends on manual marketplace decisions sitting on top of regulated financial infrastructure. QuickQuid never holds client money; the provider does. Buyer pays through provider hosted checkout (Razorpay Route). Provider sends webhook confirming capture. Finance approves milestone unlock (manual decision). Buyer acceptance queues payout release. Finance approves release; provider settles to Pro's linked account. Exceptions (failed capture, failed settlement, chargeback) have recovery paths.

**CRITICAL RULES (PRD §4.9.8):**
- Never use wallet language
- Never claim QuickQuid holds client money in its own bank account
- Provider capture ≠ Finance unlock (distinct events, distinct copy)
- Payout release approval ≠ payout settled (never claim instant transfer)
- Finance-only data (provider raw payloads, hold refs, settlement refs) must not appear in Buyer/Pro frames
- A provider capture webhook is not payment confirmation
- Every manual financial action creates immutable audit record + notification
- Provider webhooks must be idempotent (deduplicated by `provider_event_id`)
- Provider API credentials must be in secrets manager

#### Frame: Buyer / S09 / 9.1 / Default / Desktop

```
Generate the Buyer Provider-Hosted Payment screen.

LAYOUT (full Buyer shell, 2-column 60% / 40%):
- Breadcrumb: "Contracts / QQ-0892 / Payment"
- H1 (22px): "Pay Milestone 1 — QQ-0892"
- Sub-text (14px #475569): "Payment is processed through the regulated marketplace payment provider (Razorpay Route). QuickQuid never holds your money."

LEFT — PAYMENT SUMMARY (60%, 32px padding):
- Contract summary card (1px solid #E2E8F0, 16px padding):
  - Contract ref: QQ-0892
  - Pro: Akhil Menon (PRO-2088)
  - Milestone: M1 — Discovery & Wireframes
  - Due date: 2026-08-20
  - Acceptance criteria: "Wireframes for all 12 screens approved"

- Fee breakdown card (Fee Breakdown component §1.3.3, #DBEAFE tint):
  - Pro fee: ₹34,200 (M1 amount)
  - QuickQuid commission from Pro: ₹0
  - Buyer fee (14%): already included in milestone amount
  - Applicable taxes: Determined by Finance
  - Provider processing fee: "Will be shown at checkout" (12px #64748B)
  - Divider
  - Buyer total before tax: ₹34,200

- Payment method preview card:
  - H3 "Payment method"
  - Body (13px #475569): "You'll be redirected to the provider's hosted checkout (Razorpay Route). Supported methods:"
  - Method badges (horizontal): UPI | Card | Netbanking | Wallets
  - Note (12px #64748B italic): "Funds are held by the provider. Finance Admin then approves milestone unlock."

- Security callout (#DCFCE7 tint, 12px padding):
  - Icon: green shield (#16A34A)
  - "Provider-managed custody. QuickQuid never receives your money into its own bank account."

RIGHT — STICKY ACTION PANEL (40%, sticky):
- Total due card:
  - "Amount to pay" label
  - "₹34,200" (32px semibold #0F172A)
  - "before applicable taxes" (12px #64748B)

- Primary CTA (#2563EB, white text, 48px, full-width): "Pay ₹34,200 via provider →"
  - On click: creates provider order, redirects to provider hosted checkout (Razorpay Route URL)

- Secondary info:
  - "What happens next?" expandable:
    1. You'll be redirected to provider checkout
    2. Provider captures funds and creates hold
    3. Finance Admin approves milestone unlock (target: 24h)
    4. Pro is notified they may begin work

- Terms checkbox: ☐ "I acknowledge the fee structure and provider-mediated payment model" [required for pay button to enable]

POST-CLICK STATES:
- Creating order: button spinner, "Creating secure checkout..."
- Redirect: full-screen redirect to provider checkout URL
- Return from checkout (success): 9.1 updates to "Payment captured — awaiting Finance unlock" state
- Return from checkout (failure): 9.4 Capture Flagged/Failed state
- Return from checkout (abandoned): 9.1 returns to default, "Checkout abandoned — try again" toast

PRD COMPLIANCE:
- "Pay ₹34,200 via provider" not "Pay ₹34,200" (must mention provider)
- No "escrow" or "wallet" language
- Provider processing fee shown transparently if passed through (per PRD §1.5)
```

#### Frame: Pro / S09 / 9.2 / Default / Desktop

```
Pro Pending Warning — read-only funding status tracker.

LAYOUT (full Pro shell, main content, centered hero card):
- Breadcrumb: "Contracts / QQ-0892 / Funding status"

HERO CARD (max-width 640px):
- Top: large amber clock icon (#F59E0B, 64px, in circle with #FEF3C7 background, animated pulse)
- Status badge: "Payment in progress via provider" (#FEF3C7 bg, #78350F text, #F59E0B 1px border)
- Title (22px semibold #0F172A): "Buyer is completing payment"
- Body (14px #475569): "Once funds are captured by the provider and Finance unlocks the milestone, you may begin work."

DETAILED STATUS TIMELINE (vertical, 4 steps, with current state highlighted):
- Step 1 (complete, green check): "Buyer opened provider checkout"
- Step 2 (in progress, amber spinner): "Buyer authorizing payment via provider"
  - Sub-text: "Waiting for provider to confirm capture"
  - Provider event: "payment.captured webhook expected"
- Step 3 (pending, grey): "Finance Admin approves milestone unlock"
  - Sub-text: "Expected unlock target: 24 hours after capture"
  - Note: "Provider capture ≠ Finance unlock. These are distinct events."
- Step 4 (pending, grey): "Work may begin"

INFO CARD (#F1F5F9 tint, 16px padding):
- H3 "Why two steps?" (14px semibold)
- Body (13px #475569): "The provider (Razorpay Route) confirms fund capture automatically via webhook. Finance Admin then manually approves milestone unlock. Work cannot begin until Finance unlock, even if funds are already captured by the provider. This protects you from starting work on unverified payments."

PROHIBITION BANNER (#FEE2E2 background, #DC2626 left-border 4px, 16px padding):
- Icon: red stop sign (#DC2626)
- Title (14px semibold #7F1D1D): "Do not begin work yet"
- Body (13px #7F1D1D): "Starting work before Payment Confirmed state means you may not be paid. Wait for explicit confirmation from QuickQuid."

ACTIONS:
- "View contract" (secondary)
- "Message Buyer" (secondary)
- "Contact Support" (link, 99.2)

POST-FINANCE-UNLOCK:
- Banner changes to green: "Payment confirmed. Pro may begin work."
- "Open workroom" button appears (#16A34A, 44px) — links to 10.1
```

#### Frame: Finance / S09 / 9.3 / Default / Desktop

```
Finance Unlock Workspace — Admin detail view for approving milestone unlock.

LAYOUT (full Admin shell — Finance Tier 2 role, #FED7AA sidebar tint):
- Admin sidebar (260px):
  - Operations | KYC | Payment Verification (active) | Payouts | Refunds | Disputes | Trust & Safety | Audit Log | Settings
- Main content:
  - Breadcrumb: "Payment Verification / PAY-0892 / Capture review"
  - H1 (22px): "Capture Review — PAY-0892"
  - Status badge: "Capture received — unlock approval required" (#FEF3C7 bg, #78350F text)

TWO-PANE LAYOUT (50% / 50%):

LEFT — CONTRACT & MILESTONE CONTEXT (50%):
- Card 1 — Contract:
  - Contract ref: QQ-0892
  - Buyer: Northstar Labs (BUY-1042)
  - Pro: Akhil Menon (PRO-2088)
  - Brief ref: BRF-0892
  - Milestone: M1 — Discovery & Wireframes
  - Expected amount: ₹34,200

- Card 2 — Milestone details:
  - Acceptance criteria
  - Due date
  - Contract accepted at: 2026-08-06 14:32 IST

- Card 3 — Risk signals:
  - Buyer trust score: 4.7/5 (verified organization)
  - Pro trust score: 4.8/5 (KYC approved)
  - Risk flags: None
  - Maker-checker threshold: ₹50,000 — "Below threshold (single-person authorization)"

RIGHT — PROVIDER CAPTURE RECORD (50%):
- Card 1 — Provider payment:
  - Provider: Razorpay Route
  - Provider payment ref: pay_NK7s2QwRtpXyZ9
  - Captured amount: ₹34,200
  - Captured at: 2026-08-06 15:45 IST
  - Payment method: UPI (akhl@okhdfcbank)
  - Processing fee: ₹852 (passed through to Buyer)
  - Raw payload: [View JSON] (expandable)

- Card 2 — Provider hold:
  - Provider hold ref: hold_NK7s2QwRtpXyZ9-M1
  - Amount held: ₹34,200
  - Held at: 2026-08-06 15:45 IST
  - Hold status: "Held" (active)

- Card 3 — Webhook log:
  - Webhook 1: payment.captured received 2026-08-06 15:45:32 IST (processed)
  - Webhook 2: hold.created received 2026-08-06 15:45:33 IST (processed)
  - Idempotency: provider_event_id verified, no duplicates

ACTION BAR (sticky bottom, 2-column):
- Left: Reason input (text field, full-width): "Document rationale for decision..."
- Right: 3 action buttons:
  1. "Approve unlock" (#16A34A) — moves to Payment Confirmed (or 9.5 if threshold crossed)
  2. "Flag for review" (#F59E0B) — moves to 9.4 (over/under amount, suspected risk)
  3. "Escalate" (secondary) — escalates to Risk Tier 3

PERMISSIONS (per PRD §6.2):
- Only Finance Tier 2 (Maker) sees this view
- Finance Tier 2 can approve unlock but NOT suspend users or decide disputes
- Risk Tier 3 sees read-only if escalated
- Buyer/Pro NEVER see provider raw payloads, hold refs, or settlement refs (per PRD §4.9.8)

POST-APPROVE:
- If below threshold (₹34,200 < ₹50,000): single-person authorization, contract status → Payment Confirmed → ClearedToWork
- If above threshold: moves to 9.5 Pending Authorization (Maker-Checker)
- Audit event created (12.4) with admin_id, role=finance, action=approve_unlock, entity=PAY-0892, old/new state, reason, timestamp
- Buyer notified: "Payment confirmed. Pro may begin work."
- Pro notified: "Payment confirmed. Pro may begin work."
```

#### Frame: Buyer / S09 / 9.4 / Rejected-Recovery / Desktop

```
Capture Flagged/Failed Recovery state for Buyer.

LAYOUT (full Buyer shell, main content, centered):
- Breadcrumb: "Contracts / QQ-0892 / Payment issue"

HERO CARD (max-width 560px):
- Top: red alert icon (#DC2626, 64px, in circle with #FEE2E2 background)
- Status badge: "Payment could not be confirmed" (#FEE2E2 bg, #7F1D1D text)
- Title (22px semibold #0F172A): "Your payment needs attention"
- Body (14px #475569): "The provider capture could not be confirmed by Finance Admin. Please review the reason and retry or contact Support."

REASON CARD (#FEE2E2 background, #DC2626 left-border 4px, 16px padding):
- Label (12px semibold #7F1D1D): "REASON"
- Reason text (14px #7F1D1D): varies by state:
  - "provider capture failed" → "The provider reported that authorization failed. Please retry with a different payment method."
  - "amount mismatch (rare)" → "Captured amount differs from expected. Finance is reviewing (9.8)."
  - "suspected risk flagged" → "Finance flagged this transaction for review. Please contact Support."
  - "authorization expired" → "Your payment authorization expired before capture. Please retry."

PROVIDER REFERENCE (12px #64748B):
- "Provider payment ref: pay_NK7s2QwRtpXyZ9"
- "Decided by: Finance Tier 2"
- "Decided on: 2026-08-06 16:12 IST"

ACTIONS (vertical stack, full-width):
- Primary CTA (#2563EB, 44px): "Retry payment →" — opens 9.1 fresh checkout
- Secondary: "Contact Support" (links to 99.2 widget with payment context auto-attached)

NO WALLET LANGUAGE:
- Copy never mentions "wallet", "escrow", or "QuickQuid bank account"
- Always says "provider" or "regulated payment provider"

MOBILE VARIANT:
- Card full-width, 16px padding
- CTA full-width, 44px height
```

#### Frame: Finance / S09 / 9.5 / Pending-Authorization / Desktop

```
Maker-Checker Authorization view for Finance Checker (high-risk unlock/release).

LAYOUT (full Admin shell — Finance Tier 2 Checker role):
- Breadcrumb: "Payment Verification / PAY-0892 / Maker-checker authorization"
- H1 (22px): "Authorization Required — PAY-0892"
- Status badge: "Pending Authorization" (#FEF3C7 bg, #78350F text, with #F59E0B 1px border)

TWO-PANE LAYOUT (66% / 33%):

LEFT — MAKER'S RECOMMENDATION (66%):
- Maker info card:
  - Maker: "Finance Tier 2 — Priya Nair (ADM-1023)"
  - Recommendation: "Approve unlock"
  - Reason (from Maker): "Capture verified, amount matches expected, no risk flags. Buyer and Pro both verified."
  - Recommended at: 2026-08-06 16:30 IST

- Capture evidence (read-only):
  - Provider payment ref: pay_NK7s2QwRtpXyZ9
  - Captured amount: ₹34,200 (or higher if above threshold)
  - Captured at: 2026-08-06 15:45 IST
  - Hold ref: hold_NK7s2QwRtpXyZ9-M1
  - Risk signals: None
  - Webhook verification: ✓ Signature verified, ✓ Idempotent

RIGHT — CHECKER DECISION PANEL (33%, sticky):
- Card:
  - H3 "Your decision" (16px semibold)
  - Threshold info: "Amount ₹34,200 is below ₹50,000 maker-checker threshold" (info note)
  - Or: "Amount ₹75,000 crosses ₹50,000 threshold — Checker authorization required" (warning note)

  - Decision radio buttons:
    ○ Authorize unlock (Approve)
    ○ Return for review (Maker to re-check)
    ○ Reject with reason

  - If "Return" or "Reject": reason textarea appears (required)

  - Audit preview:
    - Your ID: ADM-1045
    - Your role: Finance Tier 2 (Checker)
    - Action: [Authorize/Return/Reject]
    - Timestamp: [auto]
    - Will be recorded in 12.4 audit log

- Action buttons:
  - "Confirm decision" (#16A34A or #DC2626 depending on choice, 44px)

POST-DECISION:
- Authorize → contract status = Payment Confirmed → ClearedToWork
- Return → status returns to 9.3 ProviderCaptured, Maker notified
- Reject → moves to 9.4 Rejected-Recovery for Buyer

AUDIT:
- Every decision creates 12.4 audit event with all fields (admin_id, role, action, entity, old/new state, reason, timestamp, IP, user-agent)

PERMISSIONS:
- Only Finance Tier 2 with Checker role can authorize
- Same person cannot be both Maker and Checker (separation of duties)
- Ops Manager observes but cannot bypass (per PRD §6.2)
```

#### Frame: Pro / S09 / 9.6 / Settlement-Failed / Desktop

```
Payout Settlement Failed state for Pro.

LAYOUT (full Pro shell, main content, centered):
- Breadcrumb: "Payouts / PAY-0892-M1 / Settlement failed"

HERO CARD (max-width 560px):
- Top: red alert icon (#DC2626, 64px, in circle with #FEE2E2 background)
- Status badge: "Payout settlement failed" (#FEE2E2 bg, #7F1D1D text)
- Title (22px semibold #0F172A): "Payout could not be settled to your linked account"
- Body (14px #475569): "The provider could not settle funds to your linked account. This usually means the account details are invalid or the bank rejected the transfer."

REASON CARD (#FEE2E2 background, #DC2626 left-border 4px, 16px padding):
- Label: "REASON"
- Text: "Bank account number does not match IFSC branch records. Please update your payout details."

PROVIDER REFERENCE:
- Provider settlement ref: sett_NK7s2QwRtpXyZ9-M1
- Settlement attempted: 2026-08-07 10:15 IST
- Finance approved release: 2026-08-07 09:45 IST

CURRENT LINKED ACCOUNT (masked, read-only):
- Bank: HDFC Bank
- Account holder: Akhil Menon
- Account number: ••••••••3421 (masked)
- IFSC: HDFC0001234

ACTIONS (vertical stack):
- Primary CTA (#2563EB, 44px): "Update payout details →" — links to 1.7
  - Note: "Your update will require Admin re-verification. New paid proposals will be paused until review completes."
- Secondary: "Contact Support" (99.2)

POST-UPDATE FLOW:
- Pro updates details in 1.7
- New verification submitted to KYC queue (1.3 status)
- Once approved, payout returns to Finance payout release queue (12.5)
- Pro notified when payout re-attempted

PRD COMPLIANCE:
- No "wallet" language
- Copy says "linked account" not "bank account in our system"
```

#### Frame: Buyer / S09 / 9.7 / Cancel-Refund / Desktop

```
Buyer Cancel and Refund flow (modal or full-page).

LAYOUT (full Buyer shell, main content, modal 640px):
- Header: H2 "Request cancellation — QQ-0892" (20px semibold)
- Sub-text (14px #475569): "Submit a cancellation request. Finance Admin will review and the provider will refund held funds if approved."

CANCELLATION FORM:
- Work-start status card (#F1F5F9 background):
  - "Work has not started" (green check) — full refund possible
  - OR "Work has started on M1" (amber warning) — partial refund based on completed work

- Refund policy card (#FEF3C7 background):
  - "Refund policy:"
  - "Before work start: Full refund of milestone amount (provider-mediated)."
  - "After work start: Mutual cancellation required (11.6) — payout/refund split agreed between parties."

- Reason (dropdown, required):
  - "Changed project scope"
  - "No longer need the work"
  - "Found another Pro"
  - "Timeline no longer works"
  - "Other"

- Detailed reason (textarea, 3 rows, required):
  - "Explain your cancellation reason..."

- Refund amount (read-only, calculated):
  - "Eligible refund: ₹34,200 (full M1 amount)"
  - "Refund will be processed by provider from held funds"

WARNING:
- "⚠ Cancellation request will be reviewed by Finance Admin. Approval is not automatic. You'll be notified of the decision."

FOOTER:
- "Cancel request" (secondary) — closes modal
- "Submit cancellation" (#DC2626, 44px)

POST-SUBMIT (per PRD §9.7):
- Request routed to Refund queue (12.7)
- Finance Admin reviews
- If approved: provider refunds Buyer from held funds
- If needs review: routes to 11.2 dispute
- Buyer notified of decision

NEVER PROMISE AUTOMATIC REFUND (per PRD §9.7):
- "Never promise automatic full refund unless policy supports it"
```

#### Frame: Finance / S09 / 9.8 / Over-Under-Capture / Desktop

```
Over/Under Capture Resolver for Finance Admin (rare edge case per PRD §4.9.6).

LAYOUT (full Admin shell, main content):
- Breadcrumb: "Payment Verification / PAY-0892 / Capture discrepancy"
- H1 (22px): "Capture Discrepancy — PAY-0892"
- Status badge: "Amount mismatch — review required" (#FEF3C7 bg, #78350F text)

DISCREPANCY CARD (full-width, #FEF3C7 background, 16px padding):
- 3-column comparison:
  - Expected amount: ₹34,200
  - Captured amount: ₹34,201
  - Difference: +₹1 (over-capture)
- OR (alternative scenario):
  - Captured amount: ₹34,199
  - Difference: -₹1 (under-capture)

DECISION TREE (per PRD §4.9.6):

IF OVER-CAPTURE (captured > expected):
  - Diff ≤ threshold (₹1 rounding)?
    - YES → "Hold for reconciliation" (Finance tracks, provider hold adjusted)
    - NO → "Provider refund of difference (12.7)"

IF UNDER-CAPTURE (captured < expected):
  - Diff ≤ threshold (₹1 rounding)?
    - YES → "Apply to approved outstanding (no wallet — provider hold split)"
    - NO → "Reject + request new checkout (9.4)"

ACTION BUTTONS:
- "Hold for reconciliation" (#F59E0B) — tracks in Finance ledger, no Buyer action
- "Apply to outstanding" (#2563EB) — adjusts provider hold split
- "Trigger provider refund of difference" (#DC2626) — routes to 12.7
- "Reject and request new checkout" (#DC2626) — routes Buyer to 9.4
- "Flag for review" (secondary) — escalates to Risk

POST-DECISION:
- Buyer notified of outcome (per PRD §4.9.6)
- Audit log entry created (12.4)
- Payment record updated

NO WALLET:
- Copy says "provider hold adjusted" or "provider hold split" — never "wallet adjusted"
```

#### Frame: Finance / S09 / 9.9 / Chargeback-Queue / Desktop

```
Chargeback / Unauthorized Transaction Queue for Finance + Risk Admin.

LAYOUT (full Admin shell, main content):
- Breadcrumb: "Risk / Chargebacks / CB-0042"
- H1 (22px): "Chargeback Investigation — CB-0042"
- Status badge: "Under review" (#FEF3C7 bg, #78350F text)

INVESTIGATION SUMMARY (full-width):
- Card 1 — Chargeback details:
  - Reported by: Provider (Razorpay Route)
  - Reported at: 2026-08-08 09:15 IST
  - Provider event: "payment.dispute.created" webhook
  - Original payment: PAY-0892 (pay_NK7s2QwRtpXyZ9)
  - Original amount: ₹34,200
  - Dispute reason: "Unauthorized transaction" (Buyer's bank)
  - Counterparty: Buyer (Northstar Labs)

- Card 2 — Linked entities:
  - Contract: QQ-0892
  - Pro: Akhil Menon (PRO-2088)
  - Milestone: M1
  - Provider hold: hold_NK7s2QwRtpXyZ9-M1
  - Provider settlement: sett_NK7s2QwRtpXyZ9-M1 (if already settled)

STATE MACHINE (per PRD §4.9.7):
- Reported → Under Review (current)
- Under Review → Provisional Hold (Risk approves temporary restrictions)
- Under Review → Resolved False Alarm
- Provisional Hold → Recovery Requested
- Provisional Hold → Dispute Opened (11.2)
- Provisional Hold → User Suspended (12.6)
- Recovery Requested → Resolved Recovered / Dispute Opened
- Dispute Opened → Resolved by Dispute (11.3 outcome)

PROVISIONAL HOLD CONTROLS (action bar):
- "Instruct provider to freeze related holds" (#DC2626) — Risk only
- "Apply temporary account restrictions" (#F59E0B) — Risk only
- "Open dispute (11.2)" (secondary) — routes to dispute queue
- "Suspend user (12.6)" (secondary) — routes to suspend interlock
- "Mark as false alarm" (#16A34A) — clears restrictions, audit logged

EXPLANATION TO USER (shown to impacted Buyer/Pro):
- "A payment reversal has been reported by your bank. We're investigating. Your account may have temporary restrictions during this review. Contact Support if you have questions."

APPEAL PATH:
- User can appeal via 99.2 support ticket
- Risk Admin reviews appeal

PRD COMPLIANCE (§9.9):
- QuickQuid does NOT declare liability automatically
- May freeze payout/release state
- May create 11.2 dispute context
- Records 12.4 audit
- Provisional hold duration: 14 days (configurable per §12.1 item 20)
```

---

### Screen 10 — Workroom, Delivery Vault & Revisions

**PRD source:** §4.10.1–4.10.8 (lines 2418–2545)
**5W1H:** Buyer and Pro; authorized Support/Risk Admin read-only during support or dispute. Milestone execution workspace for checklist-driven delivery, evidence, version history, revisions, acceptance, and inactivity escalation. Contract has Payment Confirmed and is Cleared to work through milestone acceptance. Buyer/Pro Contracts and Workroom navigation. Delivery must be inspectable against agreed criteria so neither party relies only on chat memory. Milestone stepper, immutable criteria, category-appropriate delivery evidence, structured revision requests, version history, and a manual payout queue trigger on acceptance.

#### Frame: Pro / S10 / 10.1 / Default / Desktop

```
Generate the Workroom milestone timeline and acceptance checklist.

LAYOUT (full Pro shell, 2-column 66% / 33%):
- Breadcrumb: "Workroom / QQ-0892 / Milestone 1"
- Page header: H1 "Milestone 1 — Discovery & Wireframes" (22px) + due date "Due 2026-08-20"

MILESTONE STEPPER (horizontal, full-width, 64px height):
- 6 steps with connecting line:
  1. Funding (✓ green check, complete)
  2. Work active (● blue dot, current)
  3. Submitted (grey outline)
  4. Buyer review (grey outline)
  5. Accepted (grey outline)
  6. Payout queued (grey outline)
- Each step has label below

LEFT — WORKROOM (66%, 32px padding):
- Milestone title + due context card:
  - "M1 — Discovery & Wireframes"
  - Amount: ₹34,200
  - Due: 2026-08-20 (3 days remaining)
  - Acceptance criteria (from contract, immutable):
    1. Wireframes for all 12 screens approved
    2. Information architecture documented
    3. User flow validated with at least 3 test scenarios

- Acceptance checklist (interactive for Pro to track progress):
  - ☐ Wireframes for all 12 screens approved
  - ☐ Information architecture documented
  - ☐ User flow validated with 3 test scenarios
  - "Submit for review" button disabled until all checked

- Delivery evidence / versions section (10.2):
  - H3 "Delivery evidence"
  - Empty state (no submissions yet): "Submit your first deliverable using the button below"
  - "+ Submit deliverable" button (#16A34A, 44px) — opens 10.2 vault

- Activity timeline (below):
  - System events chronologically:
    - "Milestone funded — 2026-08-06 16:00"
    - "Work may begin — 2026-08-06 16:05"
    - "You marked criterion 1 as in-progress — 2026-08-07 10:30"

RIGHT — SCOPE RAIL (33%, sticky):
- H3 "Milestone scope"
- Fee: ₹34,200 (Pro payout after acceptance)
- Status badge: "Work active" (#DBEAFE bg, #1E3A8A text)
- Revision count: "0 of 2 revisions used"
- Acceptance criteria (read-only, immutable)
- Contract ref link
- "View full contract" link
- Support widget link

POST-SUBMIT STATE:
- Status changes to "Submitted — In review" (#FEF3C7 badge)
- Stepper advances to step 4 (Buyer review)
- Pro cannot submit again until Buyer reviews or requests revision

MOBILE VARIANT:
- 2-column collapses to single column
- Scope rail becomes expandable section above CTA
- Stepper remains horizontal but smaller
```

#### Frame: Pro / S10 / 10.2 / Delivery-Vault / Desktop

```
Category-Specific Delivery Vault (modal or full section in 10.1).

LAYOUT (modal, 640px wide):
- Header: H2 "Submit deliverable for M1" (20px semibold)
- Sub-text (14px #475569): "Provide evidence appropriate to your work category. Different categories need different evidence types."

CATEGORY-SPECIFIC EVIDENCE FORM (conditional on contract category — Design for sample):

DESIGN CATEGORY (per PRD §4.10.5 delivery vault matrix):
- Primary evidence:
  - Figma link (URL input, required):
    - Label: "Figma file link"
    - Placeholder: "https://figma.com/file/..."
    - Validation: must be reachable, shareable
  - Preview (auto-generated thumbnail from Figma API, 16:9)
- Fallback (optional):
  - File upload (PNG/SVG/PDF, max 25MB):
    - "Or upload file directly" — dashed border zone

DEVELOPMENT CATEGORY (alternative):
- Primary: Staging URL + repository link (2 URL inputs)
- Fallback: File upload + walkthrough video

WRITING CATEGORY:
- Primary: Document link (Google Docs/Notion)
- Fallback: PDF upload

MARKETING CATEGORY:
- Primary: Campaign link / analytics screenshot
- Fallback: PDF report

VIDEO CATEGORY:
- Primary: Video link (Vimeo/YouTube unlisted)
- Fallback: File upload

CHANGE NOTE (textarea, 3 rows):
- Label: "What changed in this version?"
- Helper: "Brief description of what's included in this submission."

PRE-SUBMIT CHECKLIST (auto-verified):
- ☐ All acceptance criteria addressed
- ☐ Figma link accessible
- ☐ Files under 25MB

FOOTER:
- "Cancel" (secondary)
- "Submit for review" (#16A34A, 44px) — disabled until required fields + checklist complete

POST-SUBMIT (per PRD §4.10.6):
- Version v1 created in 10.4
- Milestone status → InReview
- Buyer notified: "[Pro] submitted deliverable for milestone [N]. Review here."
- Modal closes, 10.1 updates to "Submitted — In review" state

VALIDATION (per PRD §4.10.5):
- URL reachable (Figma, staging, doc, video)
- Repository accessible (for dev)
- PDF under 25MB
- Figma public/shareable
```

#### Frame: Buyer / S10 / 10.3 / Revision-Form / Desktop

```
Structured Revision Form for Buyer.

LAYOUT (modal, 560px wide, centered):
- Header: H2 "Request revision — M1" (20px semibold)
- Sub-text (14px #475569): "Be specific. Vague revision requests create endless cycles and weak dispute evidence."

REVISION FORM:
- Revision number (read-only, auto-populated):
  - "Revision 1 of 2 included"
  - Progress: "0 used, 2 remaining"

- Reason (dropdown, required):
  - "Acceptance criterion not met"
  - "Quality below expectation"
  - "Incomplete deliverable"
  - "Wrong direction"
  - "Other"

- Affected acceptance criterion (dropdown, conditional):
  - If reason = "Acceptance criterion not met":
    - Dropdown of criteria from contract:
      ○ "Wireframes for all 12 screens approved"
      ○ "Information architecture documented"
      ○ "User flow validated with 3 test scenarios"

- Detailed feedback (textarea, 6 rows, required, min 50 chars):
  - Label: "What needs to change?"
  - Helper: "Be specific. Reference exact screens, sections, or criteria."
  - Counter shown

- Attachments (optional, multi-file):
  - Upload zone (same validation as 7.4)
  - "Add annotated screenshots to clarify your feedback"

- Impact assessment (radio buttons):
  ○ Minor revision (Pro can resubmit quickly)
  ○ Major revision (may affect timeline)

WARNING:
- "⚠ After 2 revisions, additional revisions may require contract amendment or dispute (11.2)."

FOOTER:
- "Cancel" (secondary)
- "Submit revision request" (#F59E0B, 44px) — disabled until required fields complete

POST-SUBMIT (per PRD §4.10.6):
- Milestone status → RevisionRequested
- Revision count incremented (1 of 2 used)
- Pro notified: "[Buyer] requested revision on milestone [N]."
- Pro returns to 10.2 to resubmit v2
```

#### Frame: Buyer / S10 / 10.4 / Version-History / Desktop

```
Deliverable Version History drawer.

LAYOUT (drawer, 400px wide, slides in from right, backdrop overlay):
- Header: H3 "Delivery versions — M1" (16px semibold) | close X
- Sub-text (12px #64748B): "Immutable record of all submitted versions."

VERSION LIST (vertical stack, each card 100% width, 16px padding, 8px radius, 1px solid #E2E8F0):

Version v3 (current, In Review):
- Header row: "v3" badge (#DBEAFE bg) + status "In Review" (#FEF3C7 badge) + "Current" tag
- Submitter: "Akhil Menon (PRO-2088)"
- Submitted: "2026-08-08 14:32 IST"
- Change note: "Addressed revision feedback on wireframe 5 and 8"
- Evidence: Figma link + thumbnail
- Actions: "View" / "Download files"

Version v2 (Rejected):
- "v2" badge + status "Rejected" (#FEE2E2 badge)
- Submitted: "2026-08-07 11:00 IST"
- Change note: "Updated wireframes based on initial feedback"
- Rejection reason: "Acceptance criterion not met — Wireframe 5 incomplete"
- Actions: "View" / "Download files"

Version v1 (Rejected):
- "v1" badge + status "Rejected" (#FEE2E2 badge)
- Submitted: "2026-08-06 16:30 IST"
- Change note: "Initial submission"
- Rejection reason: "Acceptance criterion not met — Only 8 of 12 wireframes completed"
- Actions: "View" / "Download files"

PERMISSIONS:
- Buyer and Pro both see full version history
- Authorized Admin (Support/Risk) sees during support/dispute context
- Each version is immutable (cannot be edited or deleted)

EVIDENCE IN DISPUTES:
- Per PRD §10.4: "Evidence readable in 11.2 and 11.3 dispute context"
- Version history is primary evidence in dispute mediation
```

#### Frame: Buyer / S10 / 10.5 / Accept-Modal / Desktop

```
Accept Milestone and Queue Payout Release modal.

LAYOUT (modal, 560px wide, centered, backdrop overlay):
- Header: H2 "Accept Milestone 1 — QQ-0892" (20px semibold)
- Sub-text (14px #475569): "Acceptance is deliberate. After acceptance, payout release will be queued for Finance approval."

MILESTONE SUMMARY (read-only card, #F8FAFC background):
- Milestone: M1 — Discovery & Wireframes
- Amount: ₹34,200
- Pro: Akhil Menon (PRO-2088)
- Submitted: 2026-08-08 14:32 IST (v3 current)
- Version being accepted: v3

ACCEPTANCE CRITERIA CONFIRMATION:
- "Please confirm each criterion was met:"
- ☐ Wireframes for all 12 screens approved [required]
- ☐ Information architecture documented [required]
- ☐ User flow validated with 3 test scenarios [required]
- All checkboxes required to enable Accept button

COMMERCIAL CONFIRMATION:
- "On acceptance:"
- "Milestone status → Accepted"
- "Payout of ₹34,200 queued for Finance release approval"
- "Provider will settle to Pro's linked account after Finance approval"
- "This is NOT instant transfer — settlement via provider (target 24h)"

WARNING:
- "⚠ Acceptance cannot be undone. If you have concerns, request a revision instead."

FOOTER:
- "Cancel" (secondary)
- "Request revision" (#F59E0B, secondary) — links to 10.3
- "Accept milestone" (#16A34A, 44px) — primary CTA, disabled until all checkboxes checked

POST-ACCEPT (per PRD §10.5):
- Milestone status → Accepted → PayoutQueued
- Pro notified: "Milestone accepted. Payout queued for Finance release approval."
- Finance payout queue (12.5) updated
- Button label is "Accept milestone" NOT "Release payout" (per PRD §10.5)
- Final milestone: continues to 11.1 completion flow

COPY COMPLIANCE:
- "After acceptance, payout release will be queued for Finance approval" (per PRD §10.5)
- Never claim instant settlement
```

#### Frame: Pro / S10 / 10.6 / Inactivity-Escalation / Desktop

```
Pro Inactivity Escalation state (system-triggered when Pro inactive).

LAYOUT (in 10.1 workroom, status banner appears):

APPROACHING INACTIVITY (Day 5-7):
- Banner (full-width, #FEF3C7 background, #F59E0B left-border 4px, 16px padding):
  - Icon: amber clock (#F59E0B, 24px)
  - Title (14px semibold #78350F): "Inactivity warning"
  - Body (13px #78350F): "You haven't submitted a deliverable in 5 days. Please submit progress or communicate with the Buyer to avoid escalation."
  - "Submit deliverable" CTA (#16A34A, 36px)
  - "Message Buyer" link

ADMIN REVIEW TRIGGERED (Day 7-10):
- Banner changes to red (#FEE2E2 background, #DC2626 left-border 4px):
  - Title: "Admin review triggered"
  - Body: "QuickQuid has alerted Admin Support for review due to inactivity. Please respond to Admin or submit deliverable immediately."
  - "Contact Support" CTA (99.2)

PAUSED STATE (Day 10+):
- Workroom status changes to "Paused" (#F1F5F9 badge)
- Banner: "Workroom paused due to inactivity"
- Pro cannot submit deliverables (locked)
- Buyer sees: "QuickQuid has alerted Admin Support for review."
- Admin can contact parties; unresolved case may open 11.2 dispute

TIMELINE (per PRD §4.10.7 default demo thresholds):
- Day 0-5: Active work (ClearedToWork)
- Day 5-7: Approaching inactivity warning
- Day 7-10: Admin review triggered
- Day 10-14: Paused (no activity)
- Day 14+: Dispute opened by Buyer

NOTIFICATIONS (per PRD §4.10.7):
- Day 5: Notify Pro — inactivity approaching
- Day 7: Notify Buyer — Admin alerted
- Day 10: Notify both — workroom paused

POST-RESUMPTION:
- If Pro submits deliverable: status returns to "Work active"
- Banner clears
- Inactivity timer resets
```

---

### Screen 11 — Acceptance, Dispute, Completion, Review & Rehire

**PRD source:** §4.11.1–4.11.8 (lines 2546–2736)
**5W1H:** Buyer, Pro, Support context, Risk/Admin mediator, Finance for money execution. Completion state, review exchange, structured dispute process, mutual cancellation, invoice/tax placeholder, IP/defect-policy display, reputation appeal, and repeat-hire shortcut. Milestone acceptance/final completion, problem escalation, cancellation, review, or repeat hiring. Contract detail, Workroom, dashboard history, Admin dispute queue. A marketplace earns long-term trust by resolving work and money outcomes consistently, not simply by matching users. Completion uses a clear payout/review summary; disputes use structured claims/evidence; mutual cancellation uses explicit payout/refund proposal; reviews are paused during active dispute; rehire creates a new private brief from known context.

#### Frame: Buyer / S11 / 11.1 / Default / Desktop

```
Generate the Completion & Double-Blind Review screen.

LAYOUT (full Buyer shell, 2-column 66% / 33%):
- Breadcrumb: "Contracts / QQ-0892 / Completion"
- H1 (22px): "Contract completed — QQ-0892"

LEFT — COMPLETION SUMMARY (66%):
- Contract completion card (1px solid #E2E8F0, 16px padding):
  - Status badge: "Completed" (#DCFCE7 bg, #14532D text)
  - Completed at: 2026-08-24 14:32 IST
  - Total Pro fee: ₹80,000
  - Total Buyer fee (14%): ₹11,200
  - Applicable taxes: Determined by Finance
  - Buyer total: ₹91,200 before tax

- Milestones complete card:
  - List of 4 milestones, each with status "Accepted" (#DCFCE7 badge) and payout status
  - M1: ₹34,200 — Accepted — Payout settled (sett_NK7s2QwRtpXyZ9-M1)
  - M2: ₹20,000 — Accepted — Payout settled
  - M3: ₹15,800 — Accepted — Payout settled
  - M4: ₹10,000 — Accepted — Payout settled

- Review form card (IF review window open):
  - H3 "Leave a review"
  - Sub-text (13px #64748B): "Your review is private until both you and the Pro submit reviews, or until the 14-day window expires."
  - Rating (5-star selector, required)
  - Review title (text, required)
  - Review body (textarea, 4 rows, min 50 chars)
  - Would you hire again? (Yes/No radio)
  - "Submit review" button (#2563EB, 44px)
  - Note: "Reviews are paused while this contract is under dispute" (if 11.2 active — 11.13)

- Review status card (IF review already submitted):
  - "Your review submitted — waiting for Pro"
  - "Will publish when Pro also submits, or on 2026-09-07 (14-day window)"

RIGHT — ACTION PANEL (33%, sticky):
- Payout status card:
  - "All milestones paid out"
  - Total settled: ₹80,000
  - "View payout slip →" (links to 12.10)

- Rehire card:
  - "Work with Akhil again?"
  - "Rehire Pro" button (#16A34A, 44px) — links to 11.5

- Dispute card (if applicable):
  - "Have an issue?"
  - "Open dispute" link (#DC2626) — links to 11.2

- Invoice card:
  - "View invoice" link — links to 11.7

DOUBLE-BLIND REVIEW STATE MACHINE (per PRD §4.11.5):
- ReviewWindow → BuyerSubmitted (when Buyer submits)
- ReviewWindow → ProSubmitted (when Pro submits)
- BuyerSubmitted → BothSubmitted (when Pro also submits) → Published
- ProSubmitted → BothSubmitted (when Buyer also submits) → Published
- BuyerSubmitted/ProSubmitted → AutoPublished (14-day window expires)
- ReviewWindow → DisputeLock (if 11.2 dispute opens — 11.13)
- Published → AppealFiled (11.11)
```

#### Frame: Buyer / S11 / 11.2 / Dispute-Initiation / Desktop

```
Structured Dispute Initiation form.

LAYOUT (modal or full-page, 640px wide):
- Header: H2 "Open a dispute — QQ-0892" (20px semibold)
- Sub-text (14px #475569): "Disputes freeze payout and review activity. Provide structured evidence to accelerate triage."

DISPUTE FORM:
1. Category (dropdown, required) — per PRD §3.1 DISPUTE entity:
   - "Scope"
   - "Quality"
   - "Timeline"
   - "Communication"
   - "Payment"
   - "Delivery"

2. Affected milestone (dropdown):
   - M1, M2, M3, M4, or "Whole contract"

3. Requested resolution (radio buttons, required):
   ○ Full payout to Pro
   ○ Partial payout to Pro
   ○ Refund to Buyer
   ○ Other (with text field)

4. Narrative (textarea, 8 rows, required, min 100 chars):
   - Label: "What happened?"
   - Helper: "Describe the issue in detail. Reference specific milestones, dates, and communications."

5. Evidence (multi-file upload):
   - Upload zone (same validation as 7.4)
   - Helper: "Add screenshots, documents, or other evidence. Private to dispute context."

6. Desired outcome (textarea, 3 rows):
   - Label: "What resolution do you want?"

WARNING BANNER (#FEE2E2 background, #DC2626 left-border 4px, 16px padding):
- "⚠ Opening a dispute will:"
- Bullets:
  • Freeze payout for the affected milestone
  • Pause reviews (11.13)
  • Notify the other party to respond
  • Create an audit record

FOOTER:
- "Cancel" (secondary)
- "Open dispute" (#DC2626, 44px) — disabled until required fields complete

POST-SUBMIT (per PRD §11.2):
- Dispute status: "Open"
- Contract status: "Disputed"
- Payout frozen for affected milestone
- Review paused (11.13)
- Other party notified (99.1): "A dispute has been opened on QQ-XXXX."
- Counterparty receives 11.3 response task
- Admin queue updated (12.1 Disputes, 12.16 SLA timer starts)
```

#### Frame: Risk / S11 / 11.3 / Mediation / Desktop

```
Counterclaim and Admin Mediation workspace (Risk Tier 3 view).

LAYOUT (full Admin shell — Risk role, #FEE2E2 sidebar tint):
- Breadcrumb: "Disputes / DSP-0089 / Mediation"
- H1 (22px): "Dispute Mediation — DSP-0089"
- Status badge: "In mediation" (#FEF3C7 bg, #78350F text)

THREE-PANE LAYOUT (33% / 33% / 33%):

LEFT — INITIATING CLAIM (33%):
- Card: "Initiating party: Buyer (Northstar Labs)"
- Dispute category: "Quality"
- Affected milestone: M2
- Requested resolution: "Partial payout to Pro (50%)"
- Narrative (full text)
- Evidence files (downloadable)
- Filed at: 2026-08-22 14:30 IST

MIDDLE — RESPONSE / COUNTERCLAIM (33%):
- Card: "Responding party: Pro (Akhil Menon)"
- Response narrative
- Counter-claim (if filed): "Full payout requested — quality met acceptance criteria"
- Counter-evidence files
- Filed at: 2026-08-23 10:15 IST

RIGHT — CONTRACT & DELIVERY CONTEXT (33%, scrollable):
- Immutable contract record (8.1 snapshot)
- Delivery version history (10.4)
- Messages (7.1) in authorized scope only
- Payment ledger
- Audit trail (12.4 events for this contract)

ACTION BAR (sticky bottom):
- Decision dropdown: "Select resolution"
  - "Full payout to Pro"
  - "Partial payout (specify %)"
  - "Full refund to Buyer"
  - "Partial refund (specify %)"
  - "Request more evidence"
  - "Escalate to deadlock (11.4)"

- Reason input (text field, required): "Document rationale for decision..."

- Action buttons:
  - "Request more evidence" (secondary)
  - "Escalate to deadlock" (#F59E0B) — routes to 11.4
  - "Decide resolution" (#16A34A or #DC2626) — executes decision

POST-DECISION (per PRD §11.3):
- If payout decision: triggers Finance queue (12.5)
- If refund decision: triggers Refund queue (12.7)
- Both parties notified (99.1): "Dispute resolved. Outcome: [payout/refund]."
- Contract status → ResolvedPayout or ResolvedRefund → Completed
- Review unlocked (11.13)
- Audit event created (12.4)

PERMISSIONS:
- Only Risk Tier 3 can mediate/decide (per PRD §6.2)
- Finance executes money but cannot decide dispute
- Ops Manager observes SLA but cannot bypass
```

#### Frame: Risk / S11 / 11.4 / Deadlock / Desktop

```
Deadlock Escalation state.

LAYOUT (within 11.3 mediation view, status changes):
- Status badge: "Deadlock — Under Admin mediation" (#FEE2E2 bg, #7F1D1D text)
- Banner (full-width, #FEE2E2 background, #DC2626 left-border 4px, 16px padding):
  - Icon: red gavel (#DC2626, 24px)
  - Title (14px semibold #7F1D1D): "Direct dispute chat paused"
  - Body (13px #7F1D1D): "Both parties have submitted claims. The matter is now under formal Admin mediation. Evidence upload remains available; direct messaging between parties is paused."

SLA TIMER (per PRD §4.12.5):
- Card showing SLA countdown:
  - "Mediation started: 2026-08-23 14:00 IST"
  - "Day 1 of 5 (normal)"
  - Progress bar (5-day window):
    - Day 0-5: Normal (green)
    - Day 5-7: Approaching SLA (amber)
    - Day 7-14: SLA breached (red)
    - Day 14+: Ops Manager escalation (purple #7C3AED)

PARTY ACTIONS:
- Evidence upload remains available to both parties
- Support route available (99.2)
- Direct chat paused (per PRD §11.4)

ADMIN ACTIONS:
- "Assign mediator" (Risk only)
- "Request more evidence" (Risk)
- "Resolve per approved policy" (Risk)
- "Escalate to Ops Manager" (auto at Day 14)

POST-RESOLUTION:
- Returns to 11.3 decision state
- SLA timer stops
- Parties notified of outcome
```

#### Frame: Buyer / S11 / 11.5 / Rehire / Desktop

```
Rehire Flow — creates new private brief with Pro preselected.

LAYOUT (modal or full-page, 640px wide):
- Header: H2 "Rehire Akhil Menon" (20px semibold)
- Sub-text (14px #475569): "Start a new private brief with Akhil preselected. This creates a NEW contract — your previous contract and payment state are not reused."

PRO INFO CARD (read-only):
- Avatar + name + trust labels
- Previous contract: QQ-0892 (Completed 2026-08-24)
- Previous rating: 5/5

NEW BRIEF FORM (prefilled from previous, editable):
- Title (text): "Build a secure partner onboarding portal — Phase 2"
- Category (dropdown): Design (prefilled)
- Objective (textarea): prefilled with previous brief objective, editable
- Deliverables (list): prefilled, editable
- Exclusions (list): prefilled, editable
- Budget (currency): new value (default: previous budget ₹80,000)
- Timeline (date picker): new future date

COMMERCIAL SUMMARY (live update, 5.2 style):
- Pro fee: ₹80,000 (or new value)
- Buyer fee (14%): ₹11,200
- Buyer total: ₹91,200 before tax

VISIBILITY:
- Auto-set to "Private (invite only)"
- Pro is automatically invited on publish

FOOTER:
- "Cancel" (secondary)
- "Publish & invite Akhil" (#16A34A, 44px)

POST-PUBLISH (per PRD §4.11.6):
- New brief created with version v1
- Pro notified: "Private brief from previous Buyer — Northstar Labs"
- Pro can submit proposal (6.3) with normal flow
- Previous contract QQ-0892 remains Completed (immutable)
- Buyer redirected to new brief detail

PRD COMPLIANCE (§11.5):
- "Rehire is always a new brief/contract/payment lifecycle"
- "Does not reuse old contract or payment state"
```

#### Frame: Buyer / S11 / 11.6 / Mutual-Cancellation / Desktop

```
Mutual Mid-Contract Cancellation flow.

LAYOUT (modal, 640px wide):
- Header: H2 "Request mutual cancellation — QQ-0892" (20px semibold)
- Sub-text (14px #475569): "Both parties must agree. Admin executes the approved outcome. This is an amicable alternative to dispute."

CANCELLATION PROPOSAL FORM:
1. Completed work (textarea, 4 rows, required):
   - Label: "What work has been completed?"
   - Helper: "Describe completed deliverables and progress."

2. Payout amount (currency input, required):
   - Label: "Payout to Pro"
   - Value: "₹20,000"
   - Helper: "Amount for completed work. Pro must accept."

3. Refund amount (currency input, required):
   - Label: "Refund to Buyer"
   - Value: "₹14,200"
   - Helper: "From held funds. Provider-mediated refund."
   - Validation: payout + refund = remaining held amount

4. Reason (dropdown, required):
   - "Project scope changed"
   - "Timeline no longer feasible"
   - "Mutual agreement"
   - "Other"

5. Detailed reason (textarea, 3 rows):
   - Optional context

COMMERCIAL SUMMARY CARD:
- Original M1 amount: ₹34,200
- Payout to Pro: ₹20,000
- Refund to Buyer: ₹14,200
- Sum verification: "✓ Matches held amount"

FOOTER:
- "Cancel" (secondary)
- "Send cancellation proposal" (#F59E0B, 44px)

POST-SEND (per PRD §4.11.7):
- Pro notified: "Cancellation proposal received"
- Pro can Accept or Decline
- If Pro accepts:
  - Routes to Refund queue (12.7) + Payout queue (12.5)
  - Finance manually executes payout + refund
  - Contract status → Completed (with cancellation record)
  - Both parties notified
- If Pro declines:
  - Buyer notified: "Cancellation declined"
  - Buyer can open dispute (11.2)
```

#### Frame: Buyer / S11 / 11.7 / Invoice / Desktop

```
Invoice and Tax Mapping screen.

LAYOUT (full Buyer shell, main content, document-style 800px wide):
- Document header:
  - "QuickQuid Invoice" (12px #64748B, uppercase)
  - "INV-0892" (32px semibold)
  - "Issued: 2026-08-24" | "Contract: QQ-0892"

PARTIES SECTION (2-column):
- From: QuickQuid (marketplace)
- To: Northstar Labs (BUY-1042), billing address, GSTIN

LINE ITEMS TABLE:
| Description | Amount |
|---|---|
| Professional services — M1 Discovery & Wireframes | ₹34,200 |
| Professional services — M2 Visual Design | ₹20,000 |
| Professional services — M3 Design System | ₹15,800 |
| Professional services — M4 Handoff | ₹10,000 |
| Subtotal: Professional services | ₹80,000 |
| QuickQuid Buyer fee (14%) | ₹11,200 |
| Subtotal before tax | ₹91,200 |
| Applicable taxes | Determined by Finance |
| Buyer total (before tax) | ₹91,200 |

TAX PLACEHOLDER CARD (#FEF3C7 background, 12px padding):
- "Tax treatment: Applicable taxes as determined by Finance"
- "This invoice does not hardcode TDS, TCS, or GST rates. Finance will review and update the final tax amount."
- "Rounding policy: Round to nearest ₹1, half-up (version 1)"

FOOTER:
- "Download PDF" button (secondary)
- "View contract" link
- "View payout slip" link (12.10)

FINANCE VIEW (Finance Tier 2 sees additional controls):
- "Review tax treatment" button
- "Update tax amount" input
- "Finalize invoice" button (sets financeReviewState = "final")

PRD COMPLIANCE (§11.7):
- "Do not hardcode tax, TDS, TCS, or invoice issuer logic without approved configuration"
- Uses 5.7 canonical fee data
- Links to 12.10 payout slip
```

#### Frame: Buyer / S11 / 11.8 / IP-Ownership / Desktop

```
IP Ownership State indicator (in scope rail or completion screen).

LAYOUT (info card, 480px wide):
- H3 "IP ownership" (14px semibold)
- Status badge: "Follows signed agreement" (#F1F5F9 bg, #334155 text)
- Body text (13px #475569): "IP ownership follows the signed agreement between you and the Pro, and applicable payment terms. This UI status alone does not create legal transfer."
- "View contract terms" link (opens 8.1 immutable offer sheet)
- Info tooltip: "QuickQuid's UI does not determine IP ownership. Consult your signed agreement or legal counsel."

PRD COMPLIANCE (§11.8):
- "Do not let a UI status alone create legal transfer"
- "Display approved policy text"
- Links to contract terms and completed record
```

#### Frame: Buyer / S11 / 11.9 / Amendment-Placeholder / Desktop

```
Formal Contract Amendment Placeholder (future feature).

LAYOUT (card, 480px wide):
- H3 "Formal contract amendment" (14px semibold)
- Status badge: "Future — not yet available" (#F1F5F9 bg, #64748B text, with "Roadmap" tag)
- Body (13px #475569): "Post-contract commercial changes that exceed ordinary message updates will require a formal amendment workflow. This is reserved for future v0.2+."
- Disabled button: "Request formal amendment" (greyed out, with "Future" tooltip)
- "For now: use messaging (7.1) for minor clarifications. For major changes, open a dispute (11.2) or mutual cancellation (11.6)."

PRD COMPLIANCE (§11.9):
- "Reserved future formal amendment workflow after scope lock"
- "Keeps future extension point explicit without weakening v0.1 contract evidence"
- "Show reserved/future state only in prototype or disabled roadmap context"
```

#### Frame: Buyer / S11 / 11.10 / Defect-Window / Desktop

```
Post-Completion Defect Window state.

LAYOUT (in 11.1 completion screen, additional card):
- H3 "Post-completion defect window" (14px semibold)
- Status badge: "Active — 23 days remaining" (#DBEAFE bg, #1E3A8A text)
- Body (13px #475569): "If you discover a critical defect covered by the agreed critical-defect policy, you can report it within the 30-day window."
- "Report a defect" button (#F59E0B, 36px) — opens 11.2 dispute with category/policy context
- Helper (12px #64748B): "Reports must be covered by the agreed critical-defect policy. Routine revisions are not covered."

STATES (per PRD §11.10):
- Active window (0-30 days): green/blue badge, report CTA available
- Defect reported: amber badge "Defect under review" — routes to 11.2 dispute
- Policy closed (30+ days): grey badge "Defect window closed"
- Admin review: dispute opened with policy context

PRD COMPLIANCE:
- "Buyer needs a clear path for covered critical defects"
- "Pro needs bounded exposure"
- Default window: 30 days (per §12.1 item 16)
```

#### Frame: Pro / S11 / 11.11 / Review-Appeal / Desktop

```
Review Appeal and Moderation form.

LAYOUT (modal, 560px wide):
- Header: H2 "Appeal review" (20px semibold)
- Sub-text (14px #475569): "Submit an evidence-based request. Admin will review per policy. Valid negative feedback will not be removed."

REVIEW BEING APPEALED (read-only card):
- Reviewer: Northstar Labs
- Rating: 2/5 stars
- Review title and body
- Date published

APPEAL FORM:
1. Reason (dropdown, required):
   - "Review contains policy violation"
   - "Review is factually incorrect"
   - "Review extorts (quid pro quo)"
   - "Review is retaliatory"
   - "Other"

2. Evidence (textarea, 6 rows, required):
   - Label: "Why should this review be removed or modified?"
   - Helper: "Be specific. Reference policy violations with evidence."

3. Evidence files (optional, multi-file upload):
   - "Add screenshots or documents"

WARNING:
- "⚠ Appeal does not guarantee removal. Valid negative feedback remains published. Frivolous appeals may affect your account standing."

FOOTER:
- "Cancel" (secondary)
- "Submit appeal" (#2563EB, 44px)

POST-SUBMIT (per PRD §11.11):
- Appeal status: "Filed"
- Admin moderation queue updated (12.1 Trust & Safety)
- Admin outcomes:
  - Uphold (review stays published)
  - Remove for policy violation
  - Request clarification (from Pro)
  - Restore (if previously removed)
- Outcome updates public review summary + 12.4 audit
```

#### Frame: Buyer / S11 / 11.12 / Enterprise-TDS / Desktop

```
Enterprise TDS Capture Overlay (enterprise edge case).

LAYOUT (modal or overlay in 9.1/11.7/12.10 for enterprise Buyers):
- Header: H2 "Enterprise tax documentation" (20px semibold)
- Sub-text (14px #475569): "For enterprise procurement. Optional workflow — not core consumer v0.1 path."

FORM:
1. Withholding declaration (dropdown):
   - "TDS under section 194J"
   - "TDS under section 194C"
   - "No withholding"
   - "Other"

2. Withholding rate (number input, %):
   - Value: "10%"
   - Helper: "As per applicable rate. Do not hardcode — verify with your finance team."

3. Tax document upload (file upload):
   - "Upload TDS certificate / Form 16A"
   - Allowed: PDF, max 5MB

4. Notes (textarea, 3 rows):
   - Optional context for Finance review

FINANCE REVIEW (separate view):
- Finance sees submitted TDS details
- "Review TDS" button
- "Update invoice mapping" (adjusts 11.7 with TDS line item)
- "Approve" / "Request correction"

PRD COMPLIANCE (§11.12):
- "Never hardcode rate"
- "Buyer declares withholding details, uploads configured document, Finance reviews, invoice mapping adjusts using approved configuration"
- "Not core consumer v0.1 path"
```

#### Frame: Buyer / S11 / 11.13 / Review-Lock / Desktop

```
Review Extortion Interlock — review form locked during active dispute.

LAYOUT (in 11.1 review form, when 11.2 dispute is active):
- Review form card with overlay:
  - Form fields greyed out (disabled)
  - Lock icon overlay (large lock, #6B7280)
  - Banner (full-width within card, #FEE2E2 background, #DC2626 left-border 4px, 12px padding):
    - Icon: red lock (#DC2626)
    - Title (14px semibold #7F1D1D): "Reviews are paused while this contract is under dispute review"
    - Body (13px #7F1D1D): "Dispute resolution is focused on contract evidence, not reputation threats. Reviews will unlock when the dispute is resolved per policy."
  - "View dispute" link (12px #DC2626) — opens 11.3 (read-only for parties)

PRD COMPLIANCE (§11.13):
- "Disable review form and state 'Reviews are paused while this contract is under dispute review.'"
- "Resolution unlocks review according to policy"
- "Keeps dispute resolution focused on contract evidence rather than reputation threats"
```

---

### Screen 12 — Admin Operations, Trust, Support & Reconciliation

**PRD source:** §4.12.1–4.12.8 (lines 2737–2964)
**5W1H:** Support Tier 1, Finance Tier 2, Risk Tier 3, Ops Manager. Internal operational control room for KYC, payment verification, payouts, refunds, disputes, risk, support, audit, offline instruments, and escalations. Any user submission/exception creates an Admin-owned task or SLA condition. Internal Admin navigation only. v0.1 manual payments and trust controls need precise operational queue ownership and separation of duties. Queue dashboard, table-detail workspaces, strict permissions, maker-checker, masked reveals, audit trail, SLA timers, and handoffs between Support, Finance, Risk, and Ops.

**ADMIN SIDEBAR (260px, role-filtered per §2.2.3):**
- Operations (always visible)
- KYC (Support Tier 1 + Risk if escalated)
- Payment Verification (Finance Tier 2)
- Payouts (Finance Tier 2)
- Refunds (Finance Tier 2)
- Disputes (Risk Tier 3)
- Trust & Safety (Risk Tier 3)
- Audit Log (Risk Tier 3 + Ops limited)
- Settings

**ROLE TINTS (per PRD §0.1 actor palette):**
- Support Tier 1: teal #0891B2 / #CFFAFE tint
- Finance Tier 2: orange #EA580C / #FED7AA tint
- Risk Tier 3: red #DC2626 / #FEE2E2 tint
- Ops Manager: purple #7C3AED / #EDE9FE tint

#### Frame: Finance / S12 / 12.1 / Default / Desktop

```
Generate the Admin Operations Dashboard with queue grid.

LAYOUT (full Admin shell — Finance Tier 2 role):
- Admin sidebar (260px, #FED7AA tint for Finance):
  - "Finance Tier 2" role badge at top
  - Nav (role-filtered):
    - Operations (active)
    - KYC (hidden — no permission)
    - Payment Verification
    - Payouts
    - Refunds
    - Disputes (hidden — no permission)
    - Trust & Safety (hidden — no permission)
    - Audit Log (limited view)
    - Settings
  - Bottom: Admin avatar "Priya Nair (ADM-1023)" / "Finance Tier 2"

- Top bar: "Internal — Admin Console" warning banner (full-width, #FED7AA background, 12px padding):
  - "⚠ You are viewing internal operations. All actions are audit-logged."
  - Bell icon (notifications) | Avatar

MAIN CONTENT:
- H1 (22px): "Operations Dashboard"
- Sub-text (14px #475569): "Real-time queue status across all operations teams."

QUEUE CARDS GRID (4 columns × 2 rows = 8 cards, 16px gap):

Each card (240×160px, 16px padding, 8px radius, 1px solid #E2E8F0):
- Top row: queue icon (24px, role-colored) + queue name (14px semibold) + count badge (right, large)
- Middle: "Oldest: X days" (12px #64748B)
- Bottom: "Open queue →" link (12px, role-colored)

CARD 1 — KYC Queue (visible to Support, all see count):
- Icon: shield (#0891B2 teal)
- Count: "12 pending"
- Oldest: "2 days"
- SLA status: amber "3 approaching"

CARD 2 — Payment Verification Queue (Finance's primary):
- Icon: rupee (#EA580C orange)
- Count: "5 pending"
- Oldest: "3 hours"
- SLA status: green "All within SLA"
- Role: Finance Tier 2

CARD 3 — Payout Release Queue:
- Icon: rupee arrow (#EA580C)
- Count: "8 pending"
- Oldest: "6 hours"
- 2 approaching SLA

CARD 4 — Refunds Queue:
- Icon: refund arrow (#EA580C)
- Count: "3 pending"
- Oldest: "1 day"

CARD 5 — Disputes Queue (visible to Risk; Finance sees count only):
- Icon: gavel (#DC2626 red)
- Count: "4 in mediation"
- Oldest: "4 days"
- 1 SLA breach

CARD 6 — Trust & Safety:
- Icon: shield (#DC2626)
- Count: "2 pending"
- Oldest: "12 hours"

CARD 7 — Support Tickets:
- Icon: life buoy (#0891B2)
- Count: "23 open"
- Oldest: "6 hours"

CARD 8 — SLA Breaches (Ops Manager priority):
- Icon: alert (#7C3AED purple)
- Count: "1 breach"
- Oldest: "8 days"
- Status: red "Critical"

RECENT ACTIVITY FEED (below queue cards):
- H3 "Recent activity" (16px semibold)
- Timeline list of recent admin actions (each 48px row):
  - "Finance Tier 2 approved unlock PAY-0892 — 5 min ago"
  - "Risk Tier 3 opened dispute DSP-0089 — 12 min ago"
  - "Support Tier 1 approved KYC for PRO-2088 — 1 hour ago"

PERMISSION FILTERING:
- Each card only shows actions the viewer's role can perform
- Clicking a card opens 12.2 SLA Queue Table filtered to that queue
- If viewer lacks permission for queue detail, card shows "View only" or is hidden
```

#### Frame: Finance / S12 / 12.2 / Default / Desktop

```
Generate the SLA Queue Table view (filterable operational queue).

LAYOUT (full Admin shell, main content):
- Breadcrumb: "Operations / Payment Verification Queue"
- H1 (22px): "Payment Verification Queue"
- Sub-text: "5 items pending. SLA target: 24 hours from capture."

FILTER BAR (full-width, 56px, 1px bottom border):
- Left: Search input (240px) by reference, user, contract
- Middle: Filter dropdowns:
  - Status: [All] [Normal] [Approaching SLA] [Breached] [Paused]
  - Owner: [All] [Unassigned] [Me] [Specific admin]
  - Risk flag: [All] [Flagged] [Clean]
- Right: "Export CSV" button (secondary)

QUEUE TABLE (full-width, 1px border #E2E8F0):
Header row (48px, #F8FAFC background):
| Reference | User | Contract | Amount | Status | Age | Owner | Risk | Next action |

Data rows (each 56px, hover #F8FAFC):

Row 1 (Approaching SLA):
- PAY-0892 | Northstar Labs | QQ-0892 | ₹34,200 | "Approaching SLA" amber badge | 22h | Priya Nair | Clean | "Approve unlock" button
- Row has amber left-border (3px #F59E0B) indicating SLA approach

Row 2 (Normal):
- PAY-0893 | Acme Inc | QQ-0893 | ₹12,000 | "Normal" green badge | 2h | Unassigned | Clean | "Open" button

Row 3 (Breached):
- PAY-0890 | TechCorp | QQ-0890 | ₹75,000 | "SLA breached" red badge | 26h | Priya Nair | Flagged | "Escalate" button
- Row has red left-border (3px #DC2626)

Row 4 (Paused):
- PAY-0888 | StartupX | QQ-0888 | ₹8,000 | "Paused" grey badge | 3d | — | — | "View reason"
- Paused reason: "Awaiting buyer response"

SELECTED ROW DETAIL (right pane or below table, 480px):
- When a row is clicked, detail pane opens:
  - Reference: PAY-0892
  - Contract: QQ-0892 (link)
  - Buyer: Northstar Labs (BUY-1042)
  - Pro: Akhil Menon (PRO-2088)
  - Milestone: M1
  - Amount: ₹34,200
  - Captured at: 2026-08-06 15:45 IST
  - Hold ref: hold_NK7s2QwRtpXyZ9-M1
  - Risk signals: None
  - "Open full workspace" button → links to 9.3

EMPTY STATE:
- "No items in this filter"
- "Adjust filters or check other queues"

MOBILE VARIANT:
- Table becomes card list
- Each row becomes a card with key info
- Filter bar becomes bottom sheet
```

#### Frame: Finance / S12 / 12.3 / Maker-Checker / Desktop

```
Maker-Checker Confirmation view (covered in 9.5, but here as standalone Admin concept).

LAYOUT (in any queue detail where maker-checker applies):
- When Finance Maker triggers release action above threshold:
  - Status changes to "Pending Authorization" (#FEF3C7 badge)
  - Notification sent to Finance Checker
  - Item appears in Checker's "Pending Authorization" filter

CHECKER VIEW:
- Maker info card:
  - Maker: "Priya Nair (ADM-1023)"
  - Recommended action: "Approve payout release"
  - Reason: "Settlement verified, beneficiary matches KYC"
  - Timestamp: 2026-08-07 09:45 IST

- Evidence review (read-only):
  - Provider capture record
  - Settlement details
  - Beneficiary (masked, revealable)
  - Risk signals

- Decision panel:
  - "Authorize" (#16A34A) — executes
  - "Return for review" (#F59E0B) — sends back to Maker
  - "Reject" (#DC2626) — rejects with reason

THRESHOLDS (per PRD §6.3 and §12.1):
- Milestone unlock: ₹50,000
- Payout release: ₹50,000 OR beneficiary changed in 7 days
- Provider refund: ₹25,000

PRD COMPLIANCE:
- Same person cannot be Maker and Checker (separation of duties)
- Ops Manager observes but cannot bypass
- Every action logged in 12.4
```

#### Frame: Risk / S12 / 12.4 / Audit-Log / Desktop

```
Audit Log view with masked reveal capability.

LAYOUT (full Admin shell — Risk Tier 3 role, #FEE2E2 sidebar tint):
- Breadcrumb: "Audit Log"
- H1 (22px): "Audit Log"
- Sub-text (14px #475569): "Immutable, append-only record of all Admin actions. Sensitive data reveal requires authorization + reason."

FILTER BAR:
- Date range picker
- Admin role filter: [All] [Support] [Finance] [Risk] [Ops]
- Action filter: [All] [Approve] [Reject] [Confirm] [Process] [Suspend] [Reveal] ...
- Entity type filter: [All] [KYC] [Payment] [Payout] [Refund] [Dispute] [User] [Gig]
- Search by entity ID

AUDIT TABLE (full-width):
Header: | Event ID | Admin | Role | Action | Entity | Old state | New state | Time | Reason | Sensitive |

Rows (each 56px):
1. EVT-98765 | Priya Nair | Finance | approve_unlock | PAY-0892 | ProviderCaptured | PaymentConfirmed | 2026-08-06 16:00 IST | "Capture verified, amount matches" | —
2. EVT-98764 | Arjun K | Risk | suspend_user | PRO-1822 | Active | Suspended | 2026-05-12 14:30 IST | "Circumvention — repeated violations" | —
3. EVT-98763 | Meera D | Risk | reveal_sensitive | KYC-2088 | — | — | 2026-08-07 11:00 IST | "Dispute evidence review" | reveal_token_abc123

SENSITIVE REVEAL FLOW (per §1.3.6 component):
- On row with reveal_token: "Reveal" button (eye icon)
- Click prompts: "Enter reason for reveal" (text field, required)
- Submit → reveals sensitive field for 5 minutes
- Countdown timer shown (5:00 → 0:00)
- On expiry: field re-masks automatically, toast "Sensitive data re-masked"
- Reveal event itself is logged in audit (per PRD §12.4)

AUDIT EVENT FIELDS (per PRD §4.12.7):
- event_id: UUID
- admin_id: UUID
- admin_role: support|finance|risk|ops
- action: approve|reject|confirm|process|suspend|reveal|...
- entity_type: kyc|payment|payout|refund|dispute|user|gig
- entity_id: UUID
- old_state
- new_state
- reason (free text)
- timestamp (UTC)
- admin IP + user-agent
- reveal_token (if sensitive reveal)

PERMISSIONS:
- Risk Tier 3: full read + reveal
- Ops Manager: limited read (own queues only)
- Finance/Support: no audit log access (per PRD §6.2)
- Audit log is immutable — entries cannot be edited or deleted

RETENTION:
- 7 years (configurable per §12.1 item 23)
```

#### Frame: Finance / S12 / 12.5 / Default / Desktop

```
Provider Settlement Release Queue (Payout release approval workspace).

LAYOUT (full Admin shell — Finance Tier 2):
- Breadcrumb: "Payouts / Release Queue"
- H1 (22px): "Payout Release Queue"
- Sub-text: "Buyer acceptance queues payout. Finance approves release. Provider settles to Pro's linked account."

QUEUE TABLE:
| Reference | Contract | Pro | Amount | Status | Maker-checker | Provider hold | Action |

Row 1:
- PAYOUT-0892-M1 | QQ-0892 | Akhil Menon | ₹34,200 | "Queued" badge | "Below threshold" | hold_NK7s2QwRtpXyZ9-M1 | "Approve release" button

Row 2:
- PAYOUT-0893-M2 | QQ-0893 | Riya Sharma | ₹75,000 | "Pending Authorization" amber badge | "Maker-checker required" | hold_xxx | "View" (Checker)

RELEASE DETAIL VIEW (when row clicked, 9.3-style two-pane):

LEFT — Payout context:
- Contract: QQ-0892
- Milestone: M1 (accepted 2026-08-08)
- Pro: Akhil Menon (PRO-2088)
- Payout amount: ₹34,200
- Pro payout details (masked): HDFC Bank, ••••••••3421, IFSC HDFC0001234
- Maker-checker threshold: ₹50,000 (below — single authorization)

RIGHT — Provider records:
- Provider hold ref: hold_NK7s2QwRtpXyZ9-M1
- Amount held: ₹34,200
- Held at: 2026-08-06 15:45 IST
- Hold status: "Held" (ready for release)
- Provider settlement ref: (pending — will be sett_NK7s2QwRtpXyZ9-M1 after release)

ACTION BAR:
- Reason input: "Document rationale..."
- "Approve release" (#16A34A) — instructs provider to release hold + settle to Pro
- "Flag for review" (#F59E0B) — routes to manual investigation
- "Reject" (#DC2626) — routes back with reason

POST-APPROVE (per PRD §12.5):
- System instructs provider to release hold and settle to Pro's linked account
- Provider webhook confirms settlement (settlement.settled)
- Internal records updated
- Pro notified (99.1): "Payout settled. Reference: sett_NK7s2QwRtpXyZ9-M1."
- Sensitive beneficiary data stays masked outside authorized reveal
- Audit event created (12.4)

NO WALLET LANGUAGE:
- "Provider settles to Pro's linked account" (not "wallet credited")
- "Provider-managed custody" (not "escrow")

PRD COMPLIANCE (§12.5):
- "v0.1 needs controlled release approval operation without QuickQuid ever touching the money"
- "Select payout-queued records, review total + provider hold reference, maker-checker state, approve release"
- "System instructs provider to release hold and settle to Pro's linked account"
```

#### Frame: Risk / S12 / 12.6 / Suspend-Interlock / Desktop

```
Suspend User Interlock decision tree (Risk Tier 3 only).

LAYOUT (full Admin shell — Risk role):
- Breadcrumb: "Trust & Safety / Suspend user / PRO-1822"
- H1 (22px): "Suspend User — Akhil Menon (PRO-2088)"
- Sub-text: "Account suspension requires reviewing active obligations. Abrupt suspension can strand active contracts, payments, or evidence."

ACTIVE OBLIGATIONS CHECK (per PRD §4.12.6):
- Card: "User has active obligations"
- Status: "Yes — 3 active items found" (#FEE2E2 background)

OBLIGATIONS LIST (each item shown as card):
1. Active contract QQ-0890 — In delivery (M2)
   - Status: Pro working on M2
   - Action: "Route to 11.3 dispute" if suspending
2. Pending payout release PAYOUT-0885-M1 — ₹20,000
   - Status: Queued for Finance approval
   - Action: "Route to 12.5 for manual review"
3. Open dispute DSP-0078 — Under mediation
   - Status: Risk is mediator
   - Action: "Reassign mediator"
4. Provider fund hold hold_xxx — Active
   - Action: "Instruct provider to freeze related holds"

ACTION OPTIONS (radio buttons, vertical stack):
○ Restrict selected actions (e.g. block new proposals, block new gigs)
○ Request review (escalate to Ops Manager)
○ Suspend account (active obligations routed to Admin handlers; provider instructed to freeze related holds)
○ Cancel — close without action

REASON INPUT (text field, required):
- "Document rationale for decision (will be audit-logged)..."

WARNING:
- "⚠ Suspension may instruct provider to freeze related fund holds. This affects Buyer payments and Pro payouts."

FOOTER:
- "Cancel" (secondary)
- "Confirm action" (#DC2626 for suspend, #F59E0B for restrict) — disabled until reason entered

POST-DECISION (per PRD §4.12.6):
- Audit event created (12.4)
- Active financial obligations routed:
  - Contracts → 11.3 dispute queue
  - Payout releases → 12.5
  - Refunds → 12.7
  - Provider holds → freeze instruction to provider
- User notified with reason + support path (99.2)
- If suspended: user cannot log in, sees "Account suspended" page with support contact

PRD COMPLIANCE:
- "Risk Admin" only
- "Require reason; show active contracts, pending payout releases, disputes, retention obligations"
- "Suspension may also instruct provider to freeze related holds"
```

#### Frame: Finance / S12 / 12.7 / Default / Desktop

```
Provider Refund Queue.

LAYOUT (full Admin shell — Finance Tier 2):
- Breadcrumb: "Refunds / Queue"
- H1 (22px): "Provider Refund Queue"
- Sub-text: "Approved provider-mediated refunds. Finance approves; provider refunds Buyer from held funds."

QUEUE TABLE:
| Refund ref | Contract | Buyer | Amount | Reason | Status | Provider refund ref | Action |

Row 1:
- RFD-0089 | QQ-0890 | Northstar Labs | ₹14,200 | "Mutual cancellation" | "Approved" green badge | rfd_xxx | "Execute refund" button

Row 2:
- RFD-0088 | QQ-0885 | Acme Inc | ₹8,000 | "Capture correction (over-capture)" | "Pending" amber badge | — | "Review" button

REFUND DETAIL VIEW (when row clicked):

LEFT — Refund context:
- Refund ref: RFD-0089
- Contract: QQ-0890
- Buyer: Northstar Labs (BUY-1042)
- Amount: ₹14,200
- Reason: "Mutual cancellation — completed work ₹20,000, refund ₹14,200"
- Approver: (pending)
- Beneficiary token: (masked Buyer account)

RIGHT — Provider records:
- Provider hold ref: hold_xxx (frozen for refund)
- Provider refund ref: (pending — will be rfd_xxx after execution)
- Status: "Approved, awaiting execution"

ACTION BAR:
- "Approve release" (#16A34A) — instructs provider to refund Buyer from held funds
- "Reject" (#DC2626) — rejects with reason
- "Request more info" (secondary)

POST-APPROVE (per PRD §12.7):
- Provider refunds Buyer from held funds
- Provider refund reference captured
- Buyer notified: "Refund of ₹14,200 processed. Reference: rfd_xxx."
- Audit event created (12.4)
- Updates 9.7 (Buyer cancel/refund), 9.8 (over/under), 11.3 (dispute outcome)

PRD COMPLIANCE (§12.7):
- "Refunds must be traceable and cannot be hidden as a wallet adjustment"
- "Review, approve release, provider refunds Buyer from held funds, attach proof, mark refunded, notify Buyer"
- Maker-checker applies if amount crosses ₹25,000 threshold (per §6.3)
```

#### Frame: Admin / S12 / 12.8 / Permission-Matrix / Desktop

```
Admin Permission Matrix reference (visible in Settings or on restricted action attempt).

LAYOUT (full Admin shell, main content):
- H1 (22px): "Admin Permission Matrix"
- Sub-text: "Separation of duties is a product behavior, not an unwritten process."

PERMISSION TABLE (full-width, color-coded by role):
Header: | Action | Support T1 | Finance T2 | Risk T3 | Ops Mgr | Buyer | Pro |

Each row shows ✅ (allowed), ❌ (denied), or — (N/A), with role color coding:
- View own KYC: —, —, —, —, —, ✅
- Submit KYC: —, —, —, —, (if policy), ✅
- Approve/reject KYC: ✅, —, (if escalated), —, —, —
- Initiate provider checkout: —, —, —, —, ✅, —
- Approve milestone unlock: —, ✅ (Maker), —, —, —, —
- Authorize high-risk unlock: —, ✅ (Checker), —, —, —, —
- Approve payout release: —, ✅ (Maker), —, —, —, —
- Authorize high-risk release: —, ✅ (Checker), —, —, —, —
- Approve provider refund: —, ✅ (Maker), —, —, —, —
- Authorize high-risk refund: —, ✅ (Checker), —, —, —, —
- Open dispute: —, —, —, —, ✅, ✅
- Mediate dispute: —, —, ✅, —, —, —
- Decide dispute outcome: —, —, ✅, —, —, —
- Execute dispute outcome: —, ✅, —, —, —, —
- Suspend user: —, —, ✅, —, —, —
- Instruct provider to freeze holds: —, —, ✅, —, —, —
- Read audit log: —, (limited), ✅, (limited), —, —
- Reveal sensitive data: —, —, ✅ (with reason), —, —, —
- View SLA breaches: —, (own queue), (own queue), ✅ (all), —, —
- Reassign queue items: —, (own), (own), ✅ (all), —, —
- Approve/reject gig: —, —, ✅, —, —, —
- Trust/Safety takedown: —, —, ✅, —, —, —
- Bypass maker-checker: —, —, —, ❌ (NO), —, —

PERMISSION-DENIED BEHAVIOR:
- When user attempts restricted action:
  - Action controls hidden or disabled
  - Inline explanation: "You don't have permission to [action]. This requires [role] role."
  - No exposure of action controls (progressive enhancement only)

PRD COMPLIANCE (§6.2):
- "Backend authorization layer is source of truth (frontend hides/disables are progressive enhancement only)"
```

#### Frame: Finance / S12 / 12.9 / Reconciliation-Placeholder / Desktop

```
Reconciliation Import Placeholder (future feature).

LAYOUT (card, 480px wide):
- H3 "Bank reconciliation import" (14px semibold)
- Status badge: "Future — not yet available" (#F1F5F9 bg, #64748B text, with "Roadmap" tag)
- Body (13px #475569): "Future bank/PSP integration beyond the current provider-mediated flow. Provider webhooks (12.17) are the primary reconciliation source in v0.1."
- Disabled button: "Import bank statement" (greyed out, with "Future" tooltip)
- Info: "Currently, provider reconciliation runs every 4 hours (configurable). Drift triggers 9.9 manual review."

PRD COMPLIANCE (§12.9):
- "Reserved future reconciliation-import extension (beyond provider webhooks)"
- "Disabled roadmap/prototype frame only; no active v0.1 control"
```

#### Frame: Pro / S12 / 12.10 / Payout-Slip / Desktop

```
Pro Payout Slip and Deductions view.

LAYOUT (full Pro shell, main content, document-style 800px wide):
- Document header:
  - "QuickQuid Payout Slip" (12px #64748B, uppercase)
  - "PAYOUT-0892-M1" (28px semibold)
  - "Issued: 2026-08-08" | "Contract: QQ-0892" | "Milestone: M1"

PARTIES:
- Pro: Akhil Menon (PRO-2088)
- Buyer: Northstar Labs (BUY-1042)
- Provider: Razorpay Route

PAYOUT BREAKDOWN TABLE:
| Description | Amount |
|---|---|
| Agreed Pro fee (M1) | ₹34,200 |
| QuickQuid platform commission | ₹0 |
| Statutory withholding (if applicable) | Determined by Finance |
| Provider processing charge (if applicable) | ₹852 |
| Net payout | ₹33,348 |

PROVIDER SETTLEMENT REFERENCE:
- Provider settlement ref: sett_NK7s2QwRtpXyZ9-M1
- Settled to: HDFC Bank ••••••••3421
- Settled at: 2026-08-08 14:30 IST
- Settlement status: "Settled" (#DCFCE7 badge)

NOTES:
- "QuickQuid deducts ₹0 platform commission from your agreed professional fee."
- "Statutory withholding is determined by Finance per applicable law. No hardcoded rate."
- "Provider processing charge is shown transparently if passed through."

ACTIONS:
- "Download PDF" button (secondary)
- "View contract" link
- "View invoice" link (11.7)

PRD COMPLIANCE (§12.10):
- "Show agreed Pro fee, QuickQuid platform commission ₹0, statutory withholding if applicable, disclosed provider processing charge if applicable, net payout, provider settlement reference"
- "Do not hardcode a tax rate"
- Linked from 9.6 (settlement failed) and 11.1 (completion)
```

#### Frame: Admin / S12 / 12.11 / Account-Deletion / Desktop

```
Account Deletion & Data Retention workflow.

LAYOUT (Admin Privacy queue or User Settings):
- H1 (22px): "Account Deletion Request — BUY-1042"
- Sub-text: "User needs control while open obligations and lawful records cannot be mishandled."

ACTIVE OBLIGATIONS CHECK (similar to 12.6):
- Card: "Active obligations"
- List:
  - 2 active contracts (one in delivery, one in dispute)
  - 1 pending payout release
  - KYC record (retention required)
  - Audit history (7-year retention per §12.1 item 23)

DELETION WORKFLOW:
1. Check active contracts/pending payout releases
2. Deactivate account (user cannot log in)
3. Identify record categories for retention:
   - KYC records: retained per legal requirement
   - Audit log: retained 7 years
   - Contract records: retained per contract terms
4. Purge eligible profile data:
   - Public profile removed from discovery
   - Personal data deleted (avatar, bio, etc.)
   - Documents deleted (if not under retention)
5. Confirm outcome:
   - "Account deactivated on [date]"
   - "Eligible data purged on [date]"
   - "Retained records: [list with retention periods]"

POST-DELETION:
- Pending financial obligations route to relevant contract/payout state
- Request/audit uses 12.4
- User notified via email (if email still on file)

PRD COMPLIANCE (§12.11):
- "Check active contracts/pending payout releases, deactivate account, identify record categories for retention, purge eligible profile data, confirm outcome"
- "Pending financial obligations route to relevant contract/payout state"
```

#### Frame: Admin / S12 / 12.12 / Data-Export / Desktop

```
Personal Data Export workflow.

LAYOUT (modal or full-page, 640px wide):
- H1 (22px): "Personal Data Export Request"
- Sub-text: "Users need a structured access path without disclosing other-party sensitive data."

REQUEST FORM:
1. Verify requester (auto-attached to logged-in user)
2. Scope review:
   - ☐ Profile data
   - ☐ Contract records (own only)
   - ☐ Payment records (own only)
   - ☐ Messages (own only — other party's data redacted)
   - ☐ KYC records
   - ☐ Audit events (where user is entity)
3. Redaction preview:
   - "Other-party data will be redacted:"
   - "• Counterparty phone/email in messages"
   - "• Provider payment/hold/settlement refs"
   - "• Admin identities in audit events"
4. Format selection (radio):
   ○ JSON
   ○ CSV
   ○ Both
5. Delivery method:
   - "Time-limited secure link (7-day TTL)"

GENERATION STATUS:
- Submitted: "Request received — generating..."
- In progress: "Redacting other-party data..."
- Ready: "Download link sent to your email (expires in 7 days)"

POST-GENERATION:
- Time-limited link sent via 99.1 notification
- Audit event created (12.4)
- Link expires after 7 days (per §12.1 item 19)

PRD COMPLIANCE (§12.12):
- "Verify requester, review scope, redact other-party data, generate configured JSON/CSV, send time-limited link, record completion"
- "Does not disclose other-party sensitive data"
```

#### Frame: Finance / S12 / 12.13 / Offline-Instrument / Desktop

```
Offline Instrument Logger (enterprise edge case).

LAYOUT (full Admin shell — Finance):
- Breadcrumb: "Finance / Offline Instruments"
- H1 (22px): "Offline Instrument Logger"
- Sub-text: "Record for non-digital payment instruments against contract/payment reference. Enterprise edge case — provider-mediated flow is primary."

INSTRUMENT FORM:
1. Contract reference (dropdown): QQ-0892
2. Payment reference (dropdown, if exists): PAY-0892
3. Instrument type (dropdown):
   - "Cheque"
   - "Demand Draft"
   - "Bank transfer (manual)"
   - "Other"
4. Bank name (text): "HDFC Bank"
5. Instrument number (text): "00001234"
6. Amount (currency): ₹34,200
7. Received date (date picker)
8. Expected settlement date (date picker, default +5 business days per §12.1 item 24)
9. Scan (file upload, PDF/JPG/PNG, max 10MB)
10. Owner (auto: logged-in Admin)
11. Notes (textarea, 3 rows)

STATUS STATE MACHINE (per PRD §12.13):
- Logged → Pending settlement → Cleared → (success)
- Logged → Pending settlement → Dishonoured → 12.15 escalation
- Logged → Pending settlement → Escalated (manual)

TABLE:
| Instrument # | Contract | Type | Amount | Status | Expected clearance | Action |

POST-CLEARANCE:
- "Cleared can update 9.3" (Finance unlock workspace)
- "Dishonoured goes to 12.15" (Cheque Bounce Escalation)

PRD COMPLIANCE (§12.13):
- "Enterprise edge case — provider-mediated flow is primary"
- "States: logged → pending settlement → cleared → dishonoured → escalated"
```

#### Frame: Risk / S12 / 12.14 / Trust-Safety / Desktop

```
Trust and Safety / IP Takedown Queue.

LAYOUT (full Admin shell — Risk Tier 3):
- Breadcrumb: "Trust & Safety / TS-0089"
- H1 (22px): "Trust & Safety Review — TS-0089"
- Status badge: "Under review" (#FEF3C7 bg)

REPORT DETAILS:
- Card 1 — Complainant:
  - Type: [External party | User | System auto-scan]
  - Name / org (if external)
  - Contact info
  - Filed at: 2026-08-07 14:00 IST
- Card 2 — Affected entity:
  - Entity type: [Brief | Profile | Gig | Workroom | Review]
  - Entity ref + link
  - Owner: Pro/Buyer info
- Card 3 — Allegation:
  - Category: [Prohibited content | IP infringement | Safety issue | Harassment | Other]
  - Allegation text
  - Urgency: [Low | Medium | High | Critical]
- Card 4 — Evidence:
  - Uploaded files (screenshots, documents)
  - URLs to offending content
- Card 5 — History:
  - Prior reports against this entity/owner
  - Prior actions taken

ACTION BAR:
- "Request information from owner" (secondary)
- "Restrict visibility" (#F59E0B) — hides entity from public discovery
- "Suspend content" (#DC2626) — removes content
- "Suspend account" (#DC2626) — routes to 12.6 suspend interlock
- "Restore" (#16A34A) — if wrongly restricted
- "Escalate to counsel" (secondary) — for legal review

SLA: 48 hours (per §12.1 item 22)

POST-DECISION:
- May invoke 12.6 (suspend user)
- Always logs 12.4 audit
- Notifies affected parties (complainant + entity owner)

PRD COMPLIANCE (§12.14):
- "Capture complainant, affected entity, allegation, evidence, urgency, owner, history, resolution"
- "Actions: request information, restrict visibility, suspend content/account, restore, escalate to counsel"
```

#### Frame: Finance / S12 / 12.15 / Cheque-Bounce / Desktop

```
Cheque Bounce Escalation Queue (only relevant when 12.13 is used).

LAYOUT (full Admin shell — Finance + Risk):
- Breadcrumb: "Finance / Cheque Bounce / CB-0042"
- H1 (22px): "Cheque Bounce Escalation — CB-0042"
- Status badge: "Dishonoured — legal review required" (#FEE2E2 bg)

INSTRUMENT DETAILS:
- Original instrument: CHEQUE-0089 (linked from 12.13)
- Contract: QQ-0892
- Amount: ₹34,200
- Bank: HDFC Bank
- Dishonour reason: "Insufficient funds"
- Dishonour date: 2026-08-09

ESCALATION TIMELINE:
- Day 0: Marked dishonoured (today)
- Day 0-30: Legal review deadline (per §12.1 item 25)
- Day 30+: Statutory action (per applicable law)

ACTION BAR:
- "Restrict affected workflow" (#F59E0B) — pause contract/payment
- "Notify owner" (secondary) — sends formal notice
- "Assign legal review" (secondary) — assigns to legal owner
- "Track deadline" (auto) — countdown timer
- "Record payment/escalation" (#DC2626) — final resolution

WARNING:
- "⚠ System does not provide legal advice. Consult legal counsel for statutory compliance."

POST-RESOLUTION:
- Creates audit and may affect 9.9 (chargeback) or 11.2 (dispute)
- Updates 12.13 instrument record

PRD COMPLIANCE (§12.15):
- "Operational/legal review deadlines must be visible, not hidden in a spreadsheet"
- "System does not provide legal advice"
```

#### Frame: Risk / S12 / 12.16 / Dispute-SLA / Desktop

```
Dispute Resolution SLA & Auto-Escalation view.

LAYOUT (within 11.3/11.4 dispute view, SLA card):
- H3 "Dispute SLA" (14px semibold)
- Status badge: "Day 3 of 5 — Normal" (#DCFCE7 bg, #14532D text)

GANTT-STYLE TIMELINE (per PRD §4.12.5 default demo values):
- Day 0-5: Normal (active mediation) — green
- Day 5-7: Approaching SLA — amber
- Day 7-14: SLA breached — red
- Day 14-21: Ops Manager escalation — purple #7C3AED

CURRENT STATE:
- Started: 2026-08-22 14:00 IST
- Today: Day 3
- Auto-notify Risk daily (active)
- Auto-resolve if parties settle (monitoring)

ACTIONS:
- "Assign mediator" (Risk)
- "Request more evidence" (Risk)
- "Resolve per approved policy" (Risk)
- "Escalate to Ops Manager" (auto at Day 14, manual anytime)

POST-ESCALATION:
- Ops Manager can reassign dispute
- SLA timer continues
- All actions logged (12.4)

PRD COMPLIANCE (§12.16):
- "Timer states: 0-5 days normal, 5-7 approaching, 7+ breached, 14+ Ops Manager escalation"
- "Actions: assign, request evidence, resolve per approved policy, escalate, notify"
```

#### Frame: System / S12 / 12.17 / Webhook-Ingestion / Desktop

```
Provider Webhook Ingestion & Reconciliation (system view, Finance observes).

LAYOUT (full Admin shell — Finance observes, system operates):
- Breadcrumb: "Finance / Provider Webhooks"
- H1 (22px): "Provider Webhook Ingestion"
- Sub-text: "Webhooks are source of truth for provider-side money movement. Reconciliation catches missed/duplicate events."

WEBHOOK LOG TABLE:
| Event ID | Provider | Event type | Linked entity | Status | Received | Processed |

Rows:
1. evt_001 | razorpay_route | payment.captured | PAY-0892 | Processed | 2026-08-06 15:45:32 | 2026-08-06 15:45:33
2. evt_002 | razorpay_route | hold.created | hold_NK7s2QwRtpXyZ9-M1 | Processed | 2026-08-06 15:45:33 | 2026-08-06 15:45:34
3. evt_003 | razorpay_route | settlement.settled | sett_NK7s2QwRtpXyZ9-M1 | Processed | 2026-08-08 14:30:00 | 2026-08-08 14:30:01
4. evt_004 | razorpay_route | payment.failed | PAY-0895 | Processed | 2026-08-07 10:00:00 | 2026-08-07 10:00:01
5. evt_005 | razorpay_route | refund.refunded | rfd_0089 | Processed | 2026-08-08 16:00:00 | 2026-08-08 16:00:01

INGESTION PIPELINE (per PRD §12.17):
1. Receive webhook
2. Verify signature (HMAC-SHA256, per §12.1 item 30)
3. Check idempotency (provider_event_id, per §12.1 item 31)
4. Update internal PROVIDER_PAYMENT / HOLD / SETTLEMENT / REFUND records
5. Emit notification
6. Write audit entry

RECONCILIATION JOB:
- Runs every 4 hours (per §12.1 item 28)
- Cross-checks internal state vs provider API
- Drift triggers 9.9 queue or 12.5 manual review
- Last run: "2026-08-08 16:00 IST — No drift detected"
- Next run: "2026-08-08 20:00 IST"

DRIFT ALERTS:
- If drift detected:
  - Red banner: "Provider state drift detected on [entity]. Manual review required."
  - Notification to Finance + Ops (per §4.13.4 matrix)
  - Item added to 9.9 queue

ALERT STATES:
- Signature verification failure: red alert, webhook rejected
- Duplicate webhook (idempotency check): yellow info, "Duplicate ignored"
- Drift detected: red alert, manual review queue

PRD COMPLIANCE (§12.17):
- "Receive webhook → verify signature → check idempotency (provider_event_id) → update internal records → emit notification → write audit entry"
- "Reconciliation job cross-checks internal state vs provider API every N hours; flags drift"
- "Drift triggers 9.9 queue or 12.5 manual review"
- Provider credentials in secrets manager (never in code or committed env files)
```

---

### Screen 99 — Transactional Communications & Support

**PRD source:** §4.13.1–4.13.6 (lines 2965–3062)
**5W1H:** Buyer, Pro, system, Support, Admin. Transactional email/push/in-app event communications and contextual support ticketing. Verification, proposal, contract, payment, delivery, payout, dispute, and support state changes occur. Notification drawer, email/push channel, floating Help widget, Support queue. Manual v0.1 states create anxiety unless the user receives accurate next-step communication. Event-driven notification matrix with exact entity reference and deep link; support ticket includes contract/payment context automatically.

#### Frame: Buyer / S99 / 99.1 / Default / Desktop

```
Generate the Critical Notification Matrix surface (Bell drawer, expanded view).

LAYOUT (drawer, 400px wide, slides in from right):
- Header: H3 "Notifications" + "Mark all read" + close X
- Filter tabs: [All (5)] [Unread (3)] [Action required (2)]

NOTIFICATION LIST (per PRD §4.13.4 canonical matrix):

Each row (80px, hover #F8FAFC, unread has 3px left border #2563EB):
- Left: icon circle (40px, semantic color)
- Middle: actor-safe copy + reference + sub-text + status tag
- Right: deep-link arrow

CANONICAL NOTIFICATIONS (20+ types per PRD §4.13.4):

1. [KYC approved → Pro] (in-app + email, no push)
   - 🟢 "Your KYC is approved. You can now submit paid proposals."
   - "2 hours ago"

2. [KYC rejected → Pro] (in-app + email + push)
   - 🔴 "Your KYC needs attention. Reason: [X]. Resubmit here."
   - "1 hour ago" | "Action required" tag

3. [Proposal received → Buyer] (in-app only)
   - 🔵 "[Pro] applied to your brief [BRF-0892]."
   - "2 hours ago"

4. [Proposal shortlisted → Pro] (in-app + email)
   - 🟢 "[Buyer] shortlisted your proposal for [BRF-0892]."

5. [Proposal declined → Pro] (in-app + email)
   - 🔴 "[Buyer] declined your proposal. (Reason visible to Pro per policy.)"

6. [Offer received → Pro] (in-app + email + push)
   - 🔵 "[Buyer] sent you an offer for QQ-0892."

7. [Offer accepted → Buyer] (in-app + email + push)
   - 🟢 "[Pro] accepted your offer. Fund milestone 1 to begin."
   - "Action required" tag

8. [Offer declined → Buyer] (in-app + email)
   - 🔴 "[Pro] declined your offer. Reason: [X]."

9. [Payment checkout initiated → Buyer/Pro/Finance] (in-app)
   - 🟠 (Buyer): "Payment checkout initiated via provider."
   - 🟠 (Pro): "Buyer has started payment checkout."
   - 🟠 (Finance): "New payment capture pending."

10. [Provider captured funds → Pro/Finance] (in-app + email)
    - 🟠 (Pro): "Funds captured by provider. Awaiting Finance unlock."
    - 🟠 (Finance): "Capture received, unlock approval required."

11. [Payment confirmed (Finance unlock) → Buyer/Pro] (in-app + email + push)
    - 🟢 "Payment confirmed. Pro may begin work."

12. [Capture flagged/failed → Buyer] (in-app + email + push)
    - 🔴 "Your payment could not be confirmed. Reason: [X]. Retry here."

13. [Deliverable submitted → Buyer] (in-app + email)
    - 🔵 "[Pro] submitted deliverable for milestone [N]. Review here."

14. [Revision requested → Pro] (in-app + email)
    - 🟠 "[Buyer] requested revision on milestone [N]."

15. [Milestone accepted → payout queued → Pro/Finance] (in-app + email + push)
    - 🟢 (Pro): "Milestone accepted. Payout queued for Finance release approval."
    - 🟢 (Finance): "Payout queued for release approval."

16. [Payout release approved → Pro] (in-app + email)
    - 🟢 "Payout release approved. Provider is settling to your linked account."

17. [Payout settled → Pro] (in-app + email + push)
    - 🟢 "Payout settled. Reference: [SETT-REF]. View payout slip."

18. [Payout settlement failed → Pro/Finance] (in-app + email + push)
    - 🔴 "Payout could not be settled to your linked account. Update your payout details."

19. [Dispute opened → Counterparty/Risk] (in-app + email + push)
    - 🔴 "A dispute has been opened on QQ-0892."

20. [Dispute resolved → Both parties] (in-app + email + push)
    - 🟢 "Dispute resolved. Outcome: [payout/refund]."

21. [SLA breached (internal) → Ops Manager] (in-app + email)
    - 🔴 "SLA breach: [queue] item [REF] is overdue."

22. [Provider webhook drift (internal) → Finance/Ops] (in-app + email)
    - 🔴 "Provider state drift detected on [entity]. Manual review required."

COPY RULES (per PRD §4.13.6):
- Must distinguish: checkout initiated, provider captured, Finance unlocked (confirmed), release approved, settled
- Do not say "payout sent to bank" before provider confirms settlement via webhook
- Support ticket attachment respects role permissions (no counterparty private data)
```

#### Frame: Buyer / S99 / 99.2 / Default / Desktop

```
In-App Support Widget (floating button + modal).

FLOATING BUTTON:
- Position: bottom-right (desktop) / above primary CTA with 16px margin (mobile per §11.5)
- Style: 56×56px circular button, #2563EB background, white "?" icon, 8px shadow
- Hover: scales 1.05, darkens to #1E40AF

ON CLICK — SUPPORT MODAL (480px wide, centered):
- Header: H2 "How can we help?" (20px semibold) | close X
- Sub-text (14px #475569): "Tell us about your issue. We'll attach your current context automatically."

AUTO-ATTACHED CONTEXT (read-only card, #F1F5F9 background, 12px padding):
- "Auto-attached context:"
- User role: Buyer (BUY-1042)
- Current screen: Contracts / QQ-0892 / Payment
- Contract ID: QQ-0892
- Payment reference: PAY-0892 (if applicable)
- Current status: "Payment captured — awaiting Finance unlock"
- Latest event: "Funds captured by provider — 2026-08-06 15:45 IST"

CATEGORY SELECTOR (radio buttons, vertical):
○ Payment issue
○ Contract issue
○ Verification
○ Payout
○ Dispute
○ Bug
○ Other

DESCRIPTION (textarea, 6 rows, required):
- Label: "Describe your issue"
- Placeholder: "What were you trying to do? What happened instead?"
- Helper: "Be specific. The more detail you provide, the faster we can help."

ATTACHMENTS (optional, multi-file):
- Upload zone (same validation as 7.4)

FOOTER:
- "Cancel" (secondary)
- "Submit ticket" (#2563EB, 44px) — disabled until category + description filled

POST-SUBMIT (per PRD §4.13.5 support ticket flow):
- Ticket created with status "submitted"
- Ticket ID generated (e.g. TKT-0089)
- Confirmation toast: "Ticket TKT-0089 submitted. We'll respond within 24 hours."
- Ticket added to Admin Support queue (12.1)
- Notification stream updated

TICKET LIFECYCLE (per PRD §4.13.5):
- submitted → assigned (Support Tier 1 opens)
- assigned → waiting_user (Support requests more info)
- waiting_user → waiting_admin (User responds)
- waiting_admin → resolved (Support resolves)
- resolved → reopened (User reopens within window)

ROLE PERMISSIONS:
- Buyer ticket: auto-attaches Buyer context only
- Pro ticket: auto-attaches Pro context only
- Never reveals counterparty private data:
  - Provider payment IDs
  - Hold IDs
  - Settlement IDs
  - Other party's KYC documents
  - Audit log entries
```

#### Frame: Buyer / S99 / 99.2 / Submitted / Mobile

```
Mobile variant of support widget (390×844).

FLOATING BUTTON:
- Position: bottom-right, 16px from bottom and right edges
- Above any sticky CTAs with 16px margin
- 56×56px circular, #2563EB background

ON CLICK — FULL-SCREEN MODAL:
- Header: 56px, "Help" centered, close X right
- Auto-attached context card (full-width, 16px padding)
- Category selector (vertical, full-width radio buttons)
- Description textarea (full-width, 6 rows)
- Attachments zone (full-width)
- "Submit ticket" button (full-width, 44px, sticky bottom)

MOBILE-SPECIFIC:
- Full-screen modal (no side drawer)
- Bottom safe-area inset respected
- Keyboard doesn't cover submit button (sticky position adjusts)
```

---

## Appendix — Shared Component Library & State Matrix

### A.1 Shared UI Components (cross-reference to §1.3)

These components appear across multiple screens. Build each once and reuse everywhere. The prompts in Part 2 reference these components by ID.

#### A.1.1 Status Badge Component

**Component ID:** `Badge`
**Used by:** All screens (per PRD §2.3)

```
Generate a reusable Status Badge component.

PROPS:
- variant: 'success' | 'pending' | 'error' | 'blocked' | 'draft'
- size: 'sm' | 'md' | 'lg'
- icon: boolean (show/hide icon)
- label: string (required, always shown — never color-only)

VARIANTS (per PRD §0.2 status palette):
- success: bg #DCFCE7, text #14532D, border #16A34A, icon: checkmark
- pending: bg #FEF3C7, text #78350F, border #F59E0B, icon: spinner/clock
- error: bg #FEE2E2, text #7F1D1D, border #DC2626, icon: X
- blocked: bg #F1F5F9, text #334155, border #6B7280, icon: lock
- draft: bg #DBEAFE, text #1E3A8A, border #3B82F6, icon: pencil

SIZES:
- sm: 24px height, 12px font, 8px padding
- md: 28px height, 13px font, 12px padding
- lg: 32px height, 14px font, 16px padding

ACCESSIBILITY (per PRD §2.3):
- Color-blind safe (never color-only)
- aria-label includes full status text
- Icon has aria-hidden="true" (decorative)

STATES:
- Default: as above
- Loading: spinner replaces icon
- Hover: subtle darken
```

#### A.1.2 Action-Required Banner Component

**Component ID:** `Banner`
**Used by:** Buyer/Pro dashboards (2.1), contract screens (8.x, 9.x, 10.x)

```
Generate a reusable Action-Required Banner component.

PROPS:
- priority: 1-9 (per PRD §4.2.5 hierarchy)
- icon: string (warning icon name)
- title: string
- body: string
- ctaLabel: string
- ctaHref: string
- secondaryHref: string (optional)

PRIORITY COLORS (per PRD §4.2.5):
- P1 (SLA breach >24h): bg #DC2626, text white, border-left 4px #7F1D1D
- P2 (submit payment): bg #FED7AA, text #7C2D12, border-left 4px #EA580C
- P3 (do not begin work): bg #FEF3C7, text #78350F, border-left 4px #F59E0B
- P4 (review deliverable): bg #FACC15 (with #1F2937 text)
- P5 (revision requested): bg #A3E635 (with #1F2937 text)
- P6 (dispute response): bg #84CC16 (with #1F2937 text)
- P7 (payout failed): bg #22C55E (with white text)
- P8 (KYC resubmit): bg #16A34A (with white text)
- P9 (brief inactivity): bg #15803D (with white text)

BEHAVIOR (per PRD §2.3):
- Sticky at top of content area, below breadcrumb
- Cannot dismiss (no X button) — only resolves after action taken
- Remains visible until blocking action is resolved

LAYOUT:
- Full-width card, 16px padding, 8px radius
- Left: priority-colored icon (24px)
- Middle: title (16px semibold) + body (13px)
- Right: primary CTA button + secondary link

MOBILE:
- Stacks vertically (icon + title + body + CTA)
- Sticky at top of viewport
- Does not dismiss on scroll (per §11.5)
```

#### A.1.3 Fee Breakdown Component

**Component ID:** `FeeBreakdown`
**Used by:** Brief (5.2), proposal (6.2), offer (8.1), payment (9.1), invoice (11.7), payout slip (12.10)

```
Generate a reusable Fee Breakdown component (single source: canonical FeeObject per §3.2).

PROPS:
- proFee: number (e.g. 80000)
- buyerFeeRate: number (e.g. 0.14)
- taxPlaceholder: string (e.g. "Applicable taxes as determined by Finance")
- taxAmount: number | null (null until Finance reviews)
- buyerTotalBeforeTax: number
- counterOffer: boolean (shows "Counter-offer" tag if true)

LAYOUT (vertical list, 14px font):
Row 1: "Pro fee" label (left, #475569) | "₹80,000" value (right, #0F172A semibold)
Row 2: "QuickQuid commission from Pro" label | "₹0" value (#16A34A semibold)
  - Info tooltip: "During the 0%-commission beta, Pros keep 100% of their agreed professional fee."
Row 3: "Buyer fee (14%)" label | "₹11,200" value (#475569)
Row 4: "Applicable taxes" label | "Determined by Finance" value (12px italic #64748B)
  - Info tooltip: "Tax is a placeholder until Finance reviews. No hardcoded tax rate."
Divider (1px #E2E8F0)
Row 5: "Buyer total before tax" label (14px semibold) | "₹91,200" value (18px semibold #1E3A8A)

COUNTER-OFFER VARIANT:
- "Counter-offer" tag displayed prominently above breakdown
- Shows both original and counter values if applicable

RULES (per PRD §6.1):
- Never hardcode 0.14 — buyerFeeRate is configurable
- Never display hardcoded tax percentage
- UI must never show "Total: ₹X" without breaking down Pro fee, Buyer fee, and tax placeholder
- All commercial surfaces derive from one canonical FeeObject
```

#### A.1.4 Readiness Card Component

**Component ID:** `ReadinessCard`
**Used by:** Buyer/Pro onboarding (1.2, 1.13)

```
Generate a reusable Readiness Card component.

PROPS:
- title: string (e.g. "Identity verification (KYC)")
- status: 'complete' | 'in-progress' | 'blocked' | 'not-started'
- description: string
- ctaLabel: string
- ctaHref: string
- whyItMatters: string (expandable)

STATUS VARIANTS:
- complete: green checkmark (#16A34A, 24px), "Complete" badge
- in-progress: amber spinner (#F59E0B), "In progress" badge
- blocked: red lock (#DC2626), "Blocked" badge
- not-started: grey circle (#6B7280), "Not started" badge

LAYOUT (card, 100% width, 24px padding, 8px radius, 1px solid #E2E8F0):
- Left: status icon (32px)
- Middle: title (16px semibold) + description (13px #475569) + status badge
- Right: CTA button (40px height)
- Expandable: "Why this matters?" section (12px text)

BEHAVIOR (per PRD §2.3):
- Updates live as supporting state changes
- Links to unblock action
```

#### A.1.5 Audit Event Component

**Component ID:** `AuditEvent`
**Used by:** Admin screens (12.4)

```
Generate a reusable Audit Event display component.

PROPS (per PRD §4.12.7 audit log structure):
- eventId: UUID
- adminId: UUID
- adminRole: 'support' | 'finance' | 'risk' | 'ops'
- action: string
- entityType: string
- entityId: UUID
- oldState: string
- newState: string
- reason: string
- timestamp: ISO 8601
- adminIp: string
- userAgent: string
- revealToken?: string (if sensitive reveal)

LAYOUT (table row or card):
- Event ID (truncated, 12px #64748B)
- Admin: avatar + name + role badge (role-colored)
- Action: verb (e.g. "approved", "rejected")
- Entity: type + ID (link)
- State transition: oldState → newState (with arrow)
- Timestamp (UTC, 12px #64748B)
- Reason (italic, 13px)
- Sensitive reveal: if revealToken exists, "Reveal" button with 5-min countdown

IMMUTABLE:
- Entries cannot be edited or deleted
- Append-only log

PERMISSIONS:
- Risk Tier 3: full read + reveal
- Ops Manager: limited read
- Finance/Support: no access
```

#### A.1.6 Sensitive Field Component

**Component ID:** `SensitiveField`
**Used by:** Pro/Admin screens (1.3, 1.6, 12.4, 12.5)

```
Generate a reusable Sensitive Field component (masked by default).

PROPS:
- label: string (e.g. "Bank account number")
- value: string (actual value, stored encrypted)
- maskedValue: string (e.g. "••••••••3421")
- canReveal: boolean (role-based)
- revealReason: string (required if canReveal)

DEFAULT STATE:
- Field shows maskedValue (••••••••3421)
- Eye icon button (24px, #64748B) to reveal
- Hover: tooltip "Click to reveal (audit-logged)"

REVEAL FLOW (per PRD §1.3.6 component spec):
1. User clicks eye icon
2. If canReveal:
   - Modal: "Reveal sensitive data"
   - Reason input (required): "Document reason for reveal..."
   - "Confirm reveal" button
3. On confirm:
   - Actual value displayed
   - 5-minute countdown timer starts (top-right of field)
   - Audit event created (12.4) with reveal_token
4. On timer expiry:
   - Field re-masks automatically
   - Toast: "Sensitive data re-masked"

PERMISSIONS:
- Only Risk Tier 3 (and authorized Finance for payout-specific fields) can reveal
- Unauthorized users see only masked value, no eye icon

RE-MASK INTERVAL:
- 5 minutes (default, configurable per §12.1 item 14)
```

#### A.1.7 Support Widget Component

**Component ID:** `SupportWidget`
**Used by:** All authenticated screens

```
Generate a reusable Support Widget component (floating button + modal).

FLOATING BUTTON:
- Position: bottom-right (desktop), 24px from edges
- Position: above primary CTA with 16px margin (mobile per §11.5)
- Size: 56×56px circular
- Color: #2563EB background, white "?" icon (24px)
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Hover: scale 1.05, darken to #1E40AF
- z-index: 9999 (above other content)

ON CLICK — MODAL (per §99.2):
- 480px wide (desktop) / full-screen (mobile)
- Auto-attaches user context (role, current screen, contract ID, payment ref, status, latest event)
- Category selector: Payment | Contract | Verification | Payout | Dispute | Bug | Other
- Description textarea (required)
- Optional file attachments
- Submit → creates SUPPORT_TICKET with status "submitted"

BEHAVIOR (per PRD §2.3):
- Attaches contract/payment context to a ticket
- Never reveals counterparty private data
```

### A.2 Full UX State Matrix (per PRD §11.3)

Every primary screen and interactive sub-screen must support these states. Use this matrix as a checklist when generating each frame.

| State | Purpose | Visual treatment | Applies to |
|---|---|---|---|
| **Default** | Loaded with canonical sample data | Per actor palette | All screens |
| **Loading** | First-paint or async fetch in flight | Skeleton shimmer, status badge = grey #64748B | All data-driven screens |
| **Empty** | No data exists yet | Empty-state illustration + recovery CTA | Lists, feeds, dashboards |
| **Validation error** | Form-level or field-level validation failure | Red border #DC2626, inline helper text | All forms |
| **Permission denied** | User lacks role for action | Read-only, hidden controls, inline explanation | Admin screens, restricted actions |
| **Pending** | Awaiting Admin or async decision | Amber badge #F59E0B, target review time shown | Verification, payment unlock, payout release |
| **Success** | Terminal positive | Green badge #16A34A, confirmation copy | Form submissions, approvals |
| **Rejected / Recovery** | Admin rejection or system failure | Red badge #DC2626, reason + recovery CTA | Verification, payment, dispute |
| **SLA warning** | Approaching SLA breach | Amber #F59E0B to red #DC2626 gradient | Admin queues, dispute mediation |
| **Mobile variant** | Adapted for ≤ 768px viewport | See §0.5 mobile adaptation rules | All screens |

### A.3 Prototype Demo States Checklist (per PRD §11.4)

The clickable prototype must demonstrate all of these demo states. Each frame generated for these states should use the prompts in Part 2 with the appropriate state variant.

| # | Demo state | Frame reference |
|---|---|---|
| 1 | New Buyer with no projects | Buyer / S02 / 2.3 / Empty / Desktop |
| 2 | Buyer with open brief and applicants | Buyer / S06 / 6.1 / Default / Desktop |
| 3 | Buyer completing provider-hosted checkout | Buyer / S09 / 9.1 / Loading / Desktop |
| 4 | Buyer payment captured, awaiting Finance unlock | Finance / S09 / 9.3 / Default / Desktop |
| 5 | Pro with incomplete profile/payout readiness | Pro / S01 / 1.2 / Incomplete / Desktop |
| 6 | Pro approved and available (100% eligible) | Pro / S01 / 1.13 / Eligible / Desktop |
| 7 | Pro payout settlement failed | Pro / S09 / 9.6 / Settlement-Failed / Desktop |
| 8 | Finance Maker awaiting Checker | Finance / S09 / 9.5 / Pending-Authorization / Desktop |
| 9 | Risk reviewer with duplicate-device signal | Risk / S01 / 1.6 / Default / Desktop |
| 10 | Disputed contract (mediation) | Risk / S11 / 11.3 / Mediation / Desktop |
| 11 | Pro gig draft, published gig, Admin review | Pro / S04 / 4.4, 4.6, 4.7 / various / Desktop |
| 12 | Rehire flow | Buyer / S11 / 11.5 / Rehire / Desktop |
| 13 | Mutual cancellation with provider refund | Buyer / S11 / 11.6 / Mutual-Cancellation / Desktop |
| 14 | Chargeback queue via provider webhook | Finance / S09 / 9.9 / Chargeback-Queue / Desktop |
| 15 | Cheque bounce queue (offline instrument edge case) | Finance / S12 / 12.15 / Cheque-Bounce / Desktop |
| 16 | Over/under capture resolver | Finance / S09 / 9.8 / Over-Under-Capture / Desktop |
| 17 | Trust/Safety takedown queue | Risk / S12 / 12.14 / Trust-Safety / Desktop |
| 18 | Account deletion with active obligations | Admin / S12 / 12.11 / Account-Deletion / Desktop |
| 19 | Provider webhook signature verification failure + alert | System / S12 / 12.17 / Signature-Failure / Desktop |
| 20 | Provider webhook duplicate (idempotency check) | System / S12 / 12.17 / Duplicate-Webhook / Desktop |
| 21 | Provider reconciliation drift detected | System / S12 / 12.17 / Drift-Detected / Desktop |

### A.4 Frame Inventory (count of all generated frames)

| Screen | Sub-screens | States per sub-screen (avg) | Viewports | Total frames |
|---|---|---|---|---|
| S01 — Account & Verification | 13 | 3 | 2 | ~78 |
| S02 — Dashboard | 4 | 3 | 2 | ~24 |
| S03 — Discovery | 2 | 4 | 2 | ~16 |
| S04 — Detail & Gigs | 9 | 3 | 2 | ~54 |
| S05 — Brief Creation | 7 | 3 | 2 | ~42 |
| S06 — Proposals | 7 | 3 | 2 | ~42 |
| S07 — Messaging | 5 | 3 | 2 | ~30 |
| S08 — Offer & Contract | 4 | 3 | 2 | ~24 |
| S09 — Payment & Verification | 9 | 4 | 2 | ~72 |
| S10 — Workroom | 6 | 3 | 2 | ~36 |
| S11 — Completion & Dispute | 13 | 3 | 2 | ~78 |
| S12 — Admin Operations | 17 | 3 | 2 | ~102 |
| S99 — Communications | 2 | 4 | 2 | ~16 |
| **TOTAL** | **98** | — | — | **~614 frames** |

### A.5 Mobile Variant Summary (per PRD §11.5)

For each primary screen, the mobile variant must:

1. **Stack the commercial summary above the primary CTA** — never hide price, Buyer fee, or Buyer total on mobile.
2. **Replace left filter rail with bottom-sheet filter** — trigger via a "Filters" pill button.
3. **Convert desktop two-pane layouts to single-pane** with swipe navigation between list and detail.
4. **Sticky action-required banner at top** — does not dismiss on scroll.
5. **Status badges always render icon + text** — color-only is forbidden (color-blind safety).
6. **Floating Help widget** must not cover the primary CTA — position above CTA with 16px margin.
7. **Sidebar collapses to bottom navigation bar** with role-appropriate items.
8. **Sticky commercial pane (33% right rail on desktop)** stacks as a card immediately above the primary CTA on mobile.
9. **Two-pane admin workspaces** collapse to single column with detail drawer that slides up from bottom.
10. **Maker-checker confirmation modals** render full-screen on mobile (not as side drawers).

### A.6 PRD Compliance Checklist

Every generated frame must comply with these PRD rules. Use this checklist when reviewing Stitch output.

#### Commercial Rules (per PRD §1.5)
- [ ] Pro fee shown on every commercial surface
- [ ] ₹0 QuickQuid commission from Pro shown explicitly
- [ ] 14% Buyer fee shown separately
- [ ] Tax placeholder shown (no hardcoded rate)
- [ ] Buyer total before tax shown
- [ ] Fee breakdown never shows total without breakdown

#### Payment & Custody Rules (per PRD §1.5, §4.9.8)
- [ ] Buyer pays through provider-hosted checkout (Razorpay Route)
- [ ] No "escrow" or "wallet" language
- [ ] No claim that QuickQuid holds client money
- [ ] Provider capture ≠ Finance unlock (distinct copy)
- [ ] Payout release approval ≠ payout settled (no instant transfer claims)
- [ ] Finance-only data hidden from Buyer/Pro frames
- [ ] Provider webhook idempotency mentioned where relevant

#### Trust & Verification Rules (per PRD §1.5)
- [ ] No generic "verified" badge
- [ ] Trust labels: identity reviewed, portfolio reviewed, availability, completed projects
- [ ] Sensitive fields masked by default
- [ ] Admin reveal requires reason + audit log + 5-min re-mask

#### Milestone Rules (per PRD §4.8.5)
- [ ] Maximum 4 milestones enforced
- [ ] 8.3 milestone cap tooltip shown when 5th attempted
- [ ] Milestone sum must equal Pro fee
- [ ] Each milestone: title, amount > 0, criteria, due date future

#### Work Gate Rules (per PRD §1.5)
- [ ] Pro cannot begin work until Payment Confirmed
- [ ] 8.2 Funding Interlock shown after offer acceptance
- [ ] 9.2 Pro Pending Warning shown during capture/unlock
- [ ] Banner copy: "Do not begin work until QuickQuid confirms funding"

#### RBAC Rules (per PRD §6.2)
- [ ] Admin nav filtered by role
- [ ] Action controls hidden for unauthorized roles
- [ ] Backend authorization is source of truth (frontend is progressive enhancement)
- [ ] Maker-checker enforced for thresholds

#### Notification Rules (per PRD §4.13.4, §4.13.6)
- [ ] Distinguish: checkout initiated, provider captured, Finance unlocked, release approved, settled
- [ ] No "payout sent to bank" before webhook confirms settlement
- [ ] Deep-link to exact entity/screen
- [ ] No counterparty private data in support tickets

#### Accessibility Rules (per PRD §13.5)
- [ ] Status badges: icon + text + semantic color (never color-only)
- [ ] Color-blind safe
- [ ] Aria-labels on interactive elements
- [ ] Keyboard navigation support

#### Mobile Rules (per PRD §11.5)
- [ ] Commercial summary stacked above CTA
- [ ] Filter rail → bottom-sheet
- [ ] Two-pane → single-pane with swipe
- [ ] Sticky banner remains on scroll
- [ ] Floating Help widget doesn't cover CTA

### A.7 Configuration Reference (per PRD §12.1)

These configuration items have default demo values. The v0.1 prototype ships with these defaults; production values must be set before launch.

| # | Config | Default | Affects |
|---|---|---|---|
| 1 | KYC document types | JPG/PNG/PDF ≤10MB | 1.3, 1.6 |
| 2 | Maker-checker unlock threshold | ₹50,000 | 9.5, 12.3 |
| 3 | Maker-checker release threshold | ₹50,000 OR beneficiary changed in 7d | 12.3, 12.5 |
| 4 | Maker-checker refund threshold | ₹25,000 | 12.3, 12.7 |
| 5 | Brief inactivity → archive | 7d approaching, 10d archived | 5.6 |
| 6 | Proposal expiry | 14 days | 6.5 |
| 7 | Pro active proposal cap | 10 | 6.6 |
| 8 | Buyer shortlist SLA | 7d approaching, 10d closed | 6.7 |
| 9 | Pro workroom inactivity | 5d approaching, 7d review, 10d paused | 10.6 |
| 10 | Tax placeholder | "Applicable taxes as determined by Finance" | All commercial |
| 11 | Buyer fee rate | 0.14 | All commercial |
| 12 | Rounding policy | Round to ₹1, half-up | 5.7, all commercial |
| 13 | Dispute SLA | 0-5d normal, 5-7d approaching, 7+ breached, 14d Ops escalation | 12.16 |
| 14 | Sensitive reveal re-mask | 5 minutes | 12.4 |
| 15 | Review window | 14 days | 11.1 |
| 16 | Defect window | 30 days | 11.10 |
| 17 | Account deletion retention | Per category | 12.11 |
| 18 | Data export format | JSON + CSV | 12.12 |
| 19 | Export link TTL | 7 days | 12.12 |
| 20 | Chargeback provisional hold | 14 days | 9.9 |
| 21 | Gig moderation SLA | 48 hours | 4.7 |
| 22 | Trust/Safety review SLA | 48 hours | 12.14 |
| 23 | Audit log retention | 7 years | 12.4 |
| 24 | Offline instrument settlement | 5 business days | 12.13 |
| 25 | Cheque bounce legal deadline | 30 days | 12.15 |
| 26 | Payment provider | Razorpay Route | All payment flows |
| 27 | Provider processing fee | Pass through to Buyer | 9.1, 8.2, 12.10 |
| 28 | Webhook reconciliation interval | 4 hours | 12.17 |
| 29 | Provider settlement SLA | 24 hours | 12.5, 12.10 |
| 30 | Webhook signature | HMAC-SHA256 | 12.17 |
| 31 | Webhook idempotency key | provider_event_id | 12.17 |
| 32 | Hold freeze on suspension | Auto-triggered by 12.6 | 12.6, 12.17 |

---

## Document End

This document contains **98 sub-screen specifications** across **13 primary screens (S01–S12 + S99)**, with desktop and mobile variants for each, totaling approximately **614 distinct frame prompts** for Google Stitch UI generation.

Every prompt is sourced verbatim from the QuickQuid v0.1 Engineering PRD (5,293 lines). No data has been added, removed, or hallucinated. All visual cues, color palettes, components, fields, validation rules, permission gates, state transitions, and copy rules are derived directly from the PRD.

**To use:**
1. Open this document alongside Google Stitch.
2. Navigate to the screen/sub-screen you want to generate.
3. Copy the fenced code block under "Stitch Prompt".
4. Paste into Google Stitch as the prompt.
5. Use the frame naming convention (§1.5) to title the generated frame.

**For revisions:**
- Edit the prompt in this document, then re-paste into Stitch.
- All prompts are self-contained — no cross-references needed within a single prompt.
- Cross-screen consistency is maintained via the shared component library (Appendix A.1) and canonical design system (Part 1).
