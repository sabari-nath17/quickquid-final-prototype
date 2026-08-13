# QuickQuid — Exhaustive UI Inventory & Audit

**Status:** Current state as built. No redesign suggestions. Structured for another AI to re-organize using Fitts's Law, Hick's Law, Gestalt Principles, etc.

---

## 1. LIST OF ALL SCREENS / PAGES

### Visitor (9 screens)
1. Role Selection (`role_selection`)
2. Auth / Sign-in (`auth`)
3. Readiness Dashboard (`readiness`)
36. Guest Readiness Chat (`guest_readiness_chat`)
37. Readiness Summary (`readiness_summary`)
38. Buyer Onboarding (`buyer_onboarding`)

### Buyer (8 screens)
4. Buyer Dashboard (`buyer_dashboard`)
5. Buyer Profile (`buyer_profile`)
6. Buyer Talent Discovery (`buyer_talent`)
7. Buyer Brief Creation (`buyer_brief_new`)
8. Buyer Brief Detail / ATS-lite (`buyer_brief_detail`)
9. Buyer Contract / Workroom (`buyer_contract`)
10. Buyer Payment Evidence (`buyer_payment`)
11. Buyer Messages (`buyer_messages`)

### Pro (9 screens)
12. Pro Dashboard (`pro_dashboard`)
13. Pro Profile (`pro_profile`)
14. Pro Briefs Discovery (`pro_briefs`)
15. Pro Proposals (`pro_proposals`)
16. Pro Contract / Workroom (`pro_contract`)
17. Pro Payouts (`pro_payouts`)
18. Pro Gigs Management (`pro_gigs`)
19. Pro Gig Creation Wizard (`pro_gig_new`)
20. Pro Gig Detail (`pro_gig_detail`)

### Admin (11 screens)
21. Admin Operations Dashboard (`admin_operations`)
22. Admin KYC Queue (`admin_kyc`)
23. Admin Payments Queue (`admin_payments`)
24. Admin Payouts Queue (`admin_payouts`)
25. Admin Refunds Queue (`admin_refunds`)
26. Admin Disputes Queue (`admin_disputes`)
27. Admin Trust & Safety (`admin_trust`)
28. Admin Audit Log (`admin_audit`)
29. Admin Gig Moderation (`admin_gig_moderation`)
30. Admin Notes & Permissions (`admin_notes`)
31. Media & Lifecycle Demo (`media_lifecycle_demo`)

### Support & Public (4 screens)
32. Support Tickets (`support`)
33. Public Profile (`public_profile`)
34. Brief Detail Public (`brief_detail_public`)
35. Notifications Center (`notifications`)

**Total: 38 registered routes**

### Design-source coverage

The current prototype registers 38 routes. Four are existing approved visual anchors: the landing page (documented in `design-qa.md`), Buyer Dashboard, Pro Briefs, and Admin Operations. The remaining 34 routes are the new canonical frames tracked in `design-sources/manifest.json`; the manifest also records mobile-critical routes, dominant action, state, and the implementation screenshot path to capture during QA. The supplied Buyer Dashboard direction board is retained as a visual reference only and is not counted as a route.

The source pack is durable under `design-sources/`: the supplied PNGs are preserved in `references/`, optimized WebP copies are in `webp/`, and cross-route interaction contracts are in `state-sheets/`. All screen implementations must continue using the existing QuickQuid fixtures and truth boundaries; a source frame never authorizes inventing marketplace activity, verification, ratings, or payment state.

---

## 2. SCREEN-BY-SCREEN OBJECT INVENTORY

### Screen 1: Role Selection (`role_selection`)

**Purpose:** Visitor chooses Buyer or Pro intent, then signs in.

| Object Name | Component Type | Location / Section | Hierarchy / Grouping | Visibility | Current Function |
|---|---|---|---|---|---|
| Logo "Q" | icon (div) | Top-left header | Header > Logo group | Always | Navigate to role selection |
| "QuickQuid" wordmark | text (span) | Top-left header | Header > Logo group | Always | Brand display |
| "trust-first marketplace" subtitle | text (span) | Top-left header | Header > Logo group | sm+ only | Brand subtitle |
| "Controlled beta · v0.1" pill | badge (span) | Top-right header | Header > Status group | sm+ only | Status indicator |
| Help button | button (ghost) | Top-right header | Header > Actions | Always | Navigate to support |
| Trust-first pill | badge (div) | Center hero | Hero > Badge | Always | Trust signal |
| "What are you here to do?" | h1 | Center hero | Hero > Title | Always | Page title |
| Description paragraph | p | Center hero | Hero > Description | Always | Context |
| "I want to hire" card | button (card) | Center main | Hero > Intent cards | Always | Select buyer intent |
| Briefcase icon | icon | Intent card | Card > Icon | Always | Visual |
| Value prop badge "14% flat Buyer fee" | badge | Intent card | Card > Value prop | Always | Fee transparency |
| Check-circle active indicator | icon | Intent card | Card > Active state | Conditional (selected) | Selection feedback |
| "I want to work" card | button (card) | Center main | Hero > Intent cards | Always | Select pro intent |
| User icon | icon | Intent card | Card > Icon | Always | Visual |
| Value prop badge "0% QuickQuid commission" | badge | Intent card | Card > Value prop | Always | Fee transparency |
| Account creation card | card (div) | Center main | Hero > Auth card | Conditional (intent selected) | Sign-in form |
| Google button | button (outline) | Auth card | Card > OAuth buttons | Conditional | OAuth sign-in |
| LinkedIn button | button (outline) | Auth card | Card > OAuth buttons | Conditional | OAuth sign-in |
| Email button | button (outline) | Auth card | Card > OAuth buttons | Conditional | Email sign-in |
| Email input | input | Auth card | Card > Email form | Conditional | Email entry |
| "Continue with email" button | button | Auth card | Card > Email form | Conditional | Submit email |
| Terms checkbox | checkbox | Auth card | Card > Consent | Conditional | Consent to ToS |
| Privacy checkbox | checkbox | Auth card | Card > Consent | Conditional | Consent to Privacy |
| Work relationship checkbox | checkbox | Auth card | Card > Consent | Conditional (pro only) | Pro acknowledgement |
| Terms link | link | Auth card | Card > Links | Conditional | Open ToS |
| Privacy link | link | Auth card | Card > Links | Conditional | Open Privacy |
| "Sign in" button | button (link) | Auth card | Card > Demo sign-in | Conditional | One-click demo sign-in |
| TrustStat "Identity reviewed" | card (div) | Center below | Trust stats row | Conditional (no intent) | Trust signal |
| TrustStat "Manual payment verification" | card (div) | Center below | Trust stats row | Conditional (no intent) | Trust signal |
| TrustStat "0% Pro commission" | card (div) | Center below | Trust stats row | Conditional (no intent) | Trust signal |
| "Browse the marketplace" button | button (ghost) | Center below | Browse CTA | Conditional (no intent) | Visitor browse |
| Footer trust items | text (span) | Bottom footer | Footer | Always | Legal/trust |

**Layout Hierarchy:**
```
Root (min-h-screen flex-col)
├── Header (h-16 border-b)
│   ├── Logo group (left)
│   └── Status + Help (right)
├── Main (flex-1 centered)
│   └── Container (max-w-4xl space-y-8)
│       ├── Hero (text-center space-y-3)
│       │   ├── Trust pill
│       │   ├── H1
│       └── Description
│       ├── Intent cards grid (sm:grid-cols-2)
│       │   ├── Buyer card
│       │   └── Pro card
│       ├── Auth card (conditional)
│       └── Trust stats + Browse (conditional)
└── Footer (border-t)
```

---

### Screen 4: Buyer Dashboard (`buyer_dashboard`)

**Purpose:** Buyer's home — action banner, stats, engagements, briefs, activity.

| Object Name | Component Type | Location | Hierarchy | Visibility | Function |
|---|---|---|---|---|---|
| AlertBanner (action required) | banner | Top (sticky) | Above stats | Conditional (pending payments) | Warn + CTA to submit evidence |
| QuickStats row (4 cards) | card grid | Top main | Stats section | Always | Show active briefs, proposals, contracts, payments |
| Stat card icon badge | icon (div) | Stat card | Card > Top-right | Always | Category icon |
| Stat card value | text (div) | Stat card | Card > Bottom | Always | Count |
| "Active engagements" SectionCard | card | Main | Engagements section | Always | Section header |
| Engagement card | div (role=button) | Engagements | Section > List | Conditional (contracts exist) | Open contract workroom |
| Pro avatar | avatar | Engagement card | Card > Left | Always | Pro identity |
| Contract title | h3 | Engagement card | Card > Title | Always | Contract name |
| Status badge | badge | Engagement card | Card > Right | Always | Contract status |
| Pro fee / Buyer fee / Total | text grid | Engagement card | Card > Stats row | Always | Financial breakdown |
| "Submit payment" / "Open workroom" CTA | button (link) | Engagement card | Card > Next action | Conditional (status) | Navigate to payment/contract |
| "Your briefs" SectionCard | card | Main | Briefs section | Always | Section header |
| BriefCard grid | card grid | Briefs | Section > Grid | Conditional (briefs exist) | Show briefs |
| BriefCard title | h3 | BriefCard | Card > Title | Always | Brief name |
| BriefCard status badge | badge | BriefCard | Card > Top-right | Always | Brief status |
| BriefCard budget/timeline/visibility | text grid | BriefCard | Card > Footer | Always | Brief metadata |
| BriefCard View/Apply buttons | button | BriefCard | Card > Actions | Always | Navigate |
| EmptyState (no projects) | empty state | Main | Engagements section | Conditional (no contracts) | Guide to post brief / search talent |
| "Recent activity" SectionCard | card | Bottom main | Activity section | Always | Section header |
| ActivityTimeline | timeline | Activity | Section > Timeline | Always | Show recent events |
| Timeline dot | div | Timeline | Timeline > Node | Always | Color-coded status |
| Timeline title | text | Timeline | Timeline > Content | Always | Event title |
| Timeline description | text | Timeline | Timeline > Content | Always | Event detail |
| Timeline timestamp | time | Timeline | Timeline > Right | Always | Relative time |

**Layout Hierarchy:**
```
Root (space-y-6)
├── AlertBanner (conditional)
├── QuickStats (grid-cols-4)
├── Active engagements (SectionCard)
│   ├── Engagement cards (space-y-2)
│   └── EmptyState (conditional)
├── Your briefs (SectionCard)
│   └── BriefCard grid (grid-cols-3)
└── Recent activity (SectionCard)
    └── ActivityTimeline
```

---

### Screen 6: Buyer Talent Discovery (`buyer_talent`)

**Purpose:** Browse talent (Pros) and gigs with filters.

| Object Name | Component Type | Location | Hierarchy | Visibility | Function |
|---|---|---|---|---|---|
| PageHeader "Find talent" | header | Top main | Page header | Always | Title + description |
| Talent/Gigs Tabs | tabs | Top main | Tab switcher | Always | Switch mode |
| TalentFilters sidebar | card | Left (260px) | Filter panel | Always (talent mode) | Filter Pros |
| Category select | select | Filters | Filter > Category | Always | Filter by category |
| Budget band select | select | Filters | Filter > Budget | Always | Filter by budget |
| Availability select | select | Filters | Filter > Availability | Always | Filter by availability |
| Evidence select | select | Filters | Filter > Evidence | Always | Filter by evidence |
| Reset filters button | button | Filters | Filter > Reset | Always | Clear filters |
| ProfileCard grid | card grid | Center main | Results | Conditional (talent mode) | Show Pros |
| ProfileCard avatar | avatar | ProfileCard | Card > Top-left | Always | Pro identity |
| ProfileCard name | h3 | ProfileCard | Card > Title | Always | Pro name |
| Availability badge | badge | ProfileCard | Card > Top-right | Always | Availability status |
| Verified badge | badge | ProfileCard | Card > Trust | Always | Verification count |
| Fee + projects | text | ProfileCard | Card > Footer | Always | Commercial info |
| "Priority only" toggle | checkbox | Gigs top | Filter bar | Conditional (promoted exist) | Filter to promoted only |
| Promoted gigs header | text | Gigs main | Promoted section | Conditional (promoted exist) | Section label |
| Promoted gig card + Priority badge | card + badge | Gigs main | Promoted grid | Conditional (promoted exist) | Promoted gig |
| VideoGigCard cover | div (16:9) | GigCard | Card > Cover | Always | Visual preview |
| Video preview badge | badge | GigCard | Cover > Top-left | Conditional (hasVideo) | Video indicator |
| Mute toggle | button | GigCard | Cover > Top-right | Conditional (hover + video) | Toggle audio |
| Live pulse | badge | GigCard | Cover > Bottom-left | Conditional (live) | Live indicator |
| Rating | badge | GigCard | Cover > Bottom-right | Conditional (rating) | Star rating |
| Gig title | h3 | GigCard | Card > Body | Always | Gig name |
| Gig description | p | GigCard | Card > Body | Always | Short description |
| Pro identity row | text + icon | GigCard | Card > Body | Always | Pro name + verified |
| Pro fee + delivery | text grid | GigCard | Card > Footer | Always | Commercial info |
| Views + requests | text | GigCard | Card > Metrics | Conditional (live) | Engagement metrics |
| "All gigs" header | text | Gigs main | Organic section | Conditional (promoted exist) | Section label |
| Organic gig grid | card grid | Gigs main | Organic section | Always | Show organic gigs |

---

### Screen 9: Buyer Contract / Workroom (`buyer_contract`)

**Purpose:** Contract details, milestones, delivery vault, completion, disputes.

| Object Name | Component Type | Location | Hierarchy | Visibility | Function |
|---|---|---|---|---|---|
| Contract header | header | Top main | Page header | Always | Contract ID + status |
| Workroom/Offer/Completion/Disputes tabs | tabs | Top main | Tab switcher | Always | Switch views |
| Milestone timeline (stepper) | timeline | Workroom tab | Milestone section | Always | Progress visualization |
| Milestone node | div (circle) | Stepper | Timeline > Node | Always | Status indicator (green/amber/primary/muted) |
| Milestone card | div (button) | Workroom | Milestone list | Always | Select milestone |
| Milestone label + fee | text | Milestone card | Card > Content | Always | Milestone info |
| Milestone status badge | badge | Milestone card | Card > Right | Always | Status |
| DeliveryVault | card | Workroom | Vault section | Always | Delivery record |
| Vault header | header | Vault | Vault > Top | Always | State + description |
| Vault version row | div | Vault | Vault > Version list | Conditional (versions exist) | Version record |
| Version badge | badge | Version row | Row > Left | Always | Version number |
| Current/Accepted/Rejected badge | badge | Version row | Row > Badges | Conditional | Version status |
| File/asset icon | icon | Version row | Row > Thumbnail | Always | Asset type |
| File name | text | Version row | Row > Info | Always | File/link name |
| Scan badge | badge | Version row | Row > Status | Always | Scan status |
| Preview/Download button | button | Version row | Row > Action | Conditional (permissions) | Preview/download |
| Accept milestone button | button | Version row | Row > Actions | Conditional (buyer, can accept) | Accept → queue payout |
| Request revision form | textarea + select | Version row | Row > Revision form | Conditional (buyer, revision open) | Submit revision request |
| Acceptance criteria checklist | list | Vault rail | Rail > Criteria | Always | Criteria with checkmarks |
| Commercial record | dl | Vault rail | Rail > Commercial | Always | Pro fee, commission, payment, dispute |
| Immutable offer sheet | card | Offer sheet tab | Offer section | Always | Contract terms |
| FeeBreakdown | card | Offer sheet | Offer > Fees | Always | Fee calculation |
| Completion summary | card | Completion tab | Completion section | Conditional (completed) | Accepted milestones, fees |
| Private review form | card | Completion tab | Review section | Always | Review submission |
| Star rating | button group | Review form | Form > Rating | Always | Select rating |
| Comment textarea | textarea | Review form | Form > Comment | Always | Review text |
| Photo upload thumbnails | div group | Review form | Form > Photos | Always | Image attachments |
| "Add photo" button | button | Review form | Form > Upload | Conditional (< 5 photos) | Add photo |
| Dispute form | card/dialog | Disputes tab | Dispute section | Always | Open dispute |

---

### Screen 20: Pro Gig Detail (`pro_gig_detail`)

**Purpose:** Gig preview, status, priority boost, commercial summary.

| Object Name | Component Type | Location | Hierarchy | Visibility | Function |
|---|---|---|---|---|---|
| Back to gigs | button (link) | Top | Breadcrumb | Always | Navigate back |
| Gig title + status | header | Top main | Page header | Always | Gig name + status badge |
| Edit/Pause/Resume/Archive buttons | button group | Page header | Header > Actions | Conditional (status) | Gig management |
| Preview SectionCard | card | Main | Preview section | Always | Gig preview |
| Cover image | div (16:9) | Preview | Card > Cover | Always | Visual |
| Title + description | text | Preview | Card > Body | Always | Gig info |
| Deliverables + exclusions | list | Preview | Card > Lists | Always | Scope |
| Requirements | list | Preview | Card > Lists | Always | Buyer requirements |
| Commercial summary SectionCard | card | Main | Commercial section | Always | Fee breakdown |
| FeeBreakdown | card | Commercial | Card > Fees | Always | Pro fee, commission ₹0, Buyer fee, total |
| PriorityBoostPanel | card | Main | Priority section | Conditional (approved_live) | Priority boost management |
| Boost toggle / "Boost this gig" | button | Priority panel | Panel > Default | Conditional (no boost) | Open boost form |
| Duration selector | button group | Priority panel | Panel > Form | Conditional (form open) | Select duration |
| Fee calculator | card | Priority panel | Panel > Form | Conditional (form open) | Show fee + "marketing fee" copy |
| UTR input | input | Priority panel | Panel > Form | Conditional (form open) | Payment reference |
| Method select | select | Priority panel | Panel > Form | Conditional (form open) | Payment method |
| "Submit priority payment" button | button | Priority panel | Panel > Form | Conditional (form open) | Submit payment |
| Active priority card | card (violet) | Priority panel | Panel > Active | Conditional (active) | Show countdown + analytics |
| Promoted badge | badge | Active card | Card > Badge | Conditional (active) | Priority indicator |
| Countdown text | text | Active card | Card > Info | Conditional (active) | Days remaining |
| Analytics grid (views/clicks/requests) | stat grid | Active card | Card > Analytics | Conditional (active) | Performance metrics |
| Under verification card | card (amber) | Priority panel | Panel > Review | Conditional (under review) | Show review status |
| Expired card | card (muted) | Priority panel | Panel > Expired | Conditional (expired) | Show expiry + boost again |
| Rejected card | card (red) | Priority panel | Panel > Rejected | Conditional (rejected) | Show reason + resubmit |
| Versioning interlock | card | Main | Versioning section | Always | Version policy notice |

---

### Screen 21: Admin Operations Dashboard (`admin_operations`)

**Purpose:** Queue grid + unified SLA queue.

| Object Name | Component Type | Location | Hierarchy | Visibility | Function |
|---|---|---|---|---|---|
| PageHeader | header | Top main | Page header | Always | Title + role badge |
| Role emphasis banner | banner | Top | Role banner | Conditional (role) | Role-specific guidance |
| Queue grid (9 cards) | card grid | Main | Queue section | Always | Queue overview |
| Queue card | card | Grid | Card | Always | Queue summary |
| Queue title | text | Queue card | Card > Title | Always | Queue name |
| Queue count | text | Queue card | Card > Count | Always | Item count |
| Oldest item | text | Queue card | Card > Oldest | Always | Age of oldest |
| Team | text | Queue card | Card > Team | Always | Assigned team |
| SLA badge | badge | Queue card | Card > SLA | Always | SLA status |
| "Open queue" button | button | Queue card | Card > CTA | Always | Navigate to queue |
| Unified SLA QueueTable | table | Main | SLA section | Always | All open items |
| Queue columns (ref/user/contract/amount/status/owner/created/pending/flags/next) | table columns | Queue table | Table > Columns | Always | Item details |
| SLA tone badge | badge | Queue table | Table > SLA column | Always | SLA state |
| Maker-checker policy card | card | Bottom | Policy section | Always | Policy reference |

---

## 3. GLOBAL ELEMENTS

### Navigation Map / User Flow

```
Role Selection → Auth → Readiness → Dashboard
                                    ├── Buyer: Talent → Brief → Proposals → Contract → Payment → Workroom → Completion
                                    ├── Pro: Briefs → Proposal → Contract → Workroom → Payouts
                                    │         └── Gigs → Create → Moderation → Discovery → Request → Contract
                                    └── Admin: Operations → [KYC|Payments|Payouts|Refunds|Disputes|Trust|Audit|Gig Mod|Notes]

Any screen → ⌘K Command Palette → Any screen
Any screen → Help FAB → Support Widget
Any screen → Bell → Notification Drawer
```

### Repeating Header Elements (all signed-in screens)

| Object | Type | Location | Visibility | Function |
|---|---|---|---|---|
| Menu button | button (icon) | Header left | md:hidden | Open mobile sidebar |
| Search/⌘K trigger | button | Header left (sm+) | sm+ | Open command palette |
| Search icon | button (icon) | Header left | sm:hidden | Open command palette (mobile) |
| Theme toggle (sun/moon) | button (icon) | Header right | Always | Toggle dark/light mode |
| Help button | button (icon) | Header right | Always | Open support widget |
| Notifications bell | button (icon) | Header right | Always | Open notification drawer |
| Unread count badge | badge | Bell | Conditional (unread) | Show unread count |
| Home button | button (icon) | Header right | Always | Navigate to role dashboard |

### Repeating Sidebar Elements (desktop)

| Object | Type | Location | Visibility | Function |
|---|---|---|---|---|
| Logo "Q" + wordmark | div + span | Sidebar top | Always | Brand + navigate home |
| "MENU" label | text | Sidebar nav top | Always | Section label |
| Nav items (role-specific) | button list | Sidebar nav | Always | Navigate to screens |
| Active nav item | button (highlighted) | Sidebar nav | Conditional (active) | Current page indicator |
| Trust panel | card | Sidebar bottom | Always | Role-specific trust info (0% commission / 14% fee / maker-checker) |
| Role switcher trigger | button | Sidebar bottom | Always | Open role switcher |
| Role switcher dropdown | div | Sidebar bottom | Conditional (open) | List of demo users |
| "Back to role selection" | button | Role switcher | Conditional (open) | Sign out |

### Repeating Footer Elements

| Object | Type | Location | Visibility | Function |
|---|---|---|---|---|
| "QuickQuid v0.1 prototype" text | text | Footer left | Always | Version + rules |
| "0% Pro commission · 14% beta Buyer fee" | text | Footer left | Always | Fee reminder |
| "No wallet · No automated escrow" | text | Footer right | sm+ only | Constraint reminder |

### Repeating Mobile Elements

| Object | Type | Location | Visibility | Function |
|---|---|---|---|---|
| Mobile sidebar drawer | drawer | Full screen overlay | md:hidden, conditional (open) | Navigation |
| Mobile bottom nav (5 items) | nav bar | Bottom fixed | md:hidden | Quick navigation |
| Help FAB | button (floating) | Bottom-left fixed | Always | Open support widget |

### Hidden States / Modals / Popups / Dropdowns

| State/Modal | Trigger | Content |
|---|---|---|
| Command Palette (⌘K) | Cmd/Ctrl+K or search button | Searchable nav + role switch + actions |
| Notification Drawer | Bell click | Right-side sheet with notifications |
| Support Widget | Help FAB | Right-side sheet with ticket form |
| Onboarding Tour | First dashboard visit | 5-step modal tour |
| KYC Modal | "Add verification" button | 3-step identity/payout wizard |
| Invite to Brief Modal | "Invite to brief" button | Brief selection + message |
| Decline Proposal Modal | "Decline" button | Reason select + private note |
| Review Dialog | "Write a review" button | Rating + comment + photo upload |
| Submit Deliverable Dialog | "Submit deliverable" button | Link + note form |
| Revision Dialog | "Request revision" button | Criterion select + reason |
| Dispute Dialog | "Raise issue" button | Category + narrative + evidence |
| Portfolio Lightbox | Click portfolio item | Full-screen image/video viewer |
| Confirm Reset Dialog | "Reset demo data" button | Two-step confirmation |
| Confirm Suspend Dialog | "Suspend user" button | Obligation checks + reason |
| Masked Reveal Dialog | "Reveal" button | Reason input + audit |
| Reason Dialog | Admin action buttons | Reason/category select |
| Gig Moderation Sheet | Click gig in queue | Gig preview + moderation actions |
| Payment Matcher Sheet | Click payment in queue | Split-pane bank evidence matcher |
