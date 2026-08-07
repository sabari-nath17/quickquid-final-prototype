# QuickQuid — Visual Asset Blueprint & Project Lifecycle UX Specification

**Version:** v0.1 (manual admin payments) → v0.2 (gigs)
**Roles:** Visitor, Buyer, Pro, Admin Support (T1), Finance (T2), Risk (T3), Ops Manager
**Locked business rules:** 0% Pro commission · 14% beta Buyer fee · Manual payment verification · No wallet/escrow in v0.1 · Max 4 milestones · Taxes = "Calculated by Finance if applicable"

---

## PART A — THE VISUAL ASSET BLUEPRINT (5 Media Touchpoints)

### 1. Profile Pictures & Identity (Trust Assets)

**UI Context:** Search grids, chat headers, public profiles.

**Rules:**
- **Aspect ratio:** 1:1 square, rendered at 40px (sidebar/chat), 48px (cards), 96px (public profile hero), 128px (own profile editor).
- **Default empty state:** Initials monogram on a deterministic brand color derived from `userId` hash (violet `#7C3AED`, cyan `#0891B2`, pink `#DB2777`, amber `#CA8A04`). Never a grey silhouette.
- **Upload:** JPG/PNG/WebP, max 5MB, auto-crop to square with drag-to-reposition.
- **Hover state (cards):** Avatar scales 1.05 + subtle ring (`ring-2 ring-primary/30`).
- **"Verified Pro" badge:** Overlaps bottom-right of avatar. 20px circle, emerald `bg-emerald-500` with white `ShieldCheck` icon, 2px white ring. Tooltip: "Identity reviewed · Portfolio reviewed".
- **Presence indicator (future):** Bottom-right 10px dot (green=available, amber=away, grey=offline) when presence API lands.
- **Public profile hero:** 128px avatar centered with display name + headline below. Trust labels dimensioned as pills: "Identity reviewed", "Portfolio reviewed", "Available now", "Completed projects (N)".

**Competitor reference:** Malt's professional headshot framing + Upwork's presence dots.

---

### 2. Project Previews & Gig Thumbnails (The Conversion Engine)

**UI Context:** v0.2/v0.3 Gig Feed + search results.

**Gig Card layout (16:9 cover):**
```
┌─────────────────────────────────────┐
│  ▶ [16:9 video/image cover]    4.9★ │  ← hover: video auto-plays muted
│         (muted autoplay on hover)    │
├─────────────────────────────────────┤
│ [Product Design]        [Live]      │  ← category pill + status badge
│ Design system audit & token delivery│  ← title (line-clamp-2)
│ Audit your product UI and deliver   │  ← short desc (line-clamp-2)
│ a documented design token set.      │
│ ◉ Akhil Menon · Available now       │  ← pro avatar + name + availability
├─────────────────────────────────────┤
│ Pro fee          Delivery    Revisions│
│ ₹25,000          10 days     2        │
│ 👁 142  ✉ 6                        │  ← views + requests (live gigs only)
└─────────────────────────────────────┘
```

**Rules:**
- **Aspect ratio:** 16:9 cover (cinematic, matches video). Card body below.
- **Video behavior:** Auto-play on hover (muted, loop). Pauses on mouse-leave. First frame poster image until hover. `[mute/unmute]` toggle appears top-right on hover.
- **Low-res/bad upload handling:** Blur detection on upload — if <72 DPI or <600px, show warning "This image may appear blurry to Buyers. Upload at least 1200×675." Card shows a subtle "Low res" amber pill on the cover.
- **"Aha!" moment:** Hover-to-preview lets the Buyer see work quality without clicking. Video plays inline; no navigation until click.
- **Conversion metrics:** Views + requests shown only on live gigs.

**ASCII wireframe — Gig Preview Card (video):**
```
┌──────────────────────────────────────────┐
│                                          │
│   ▶  ┌────────────────────────────┐  🔇  │
│      │  [VIDEO PLAYS ON HOVER]    │      │
│      │  muted · loop · 16:9       │      │
│      └────────────────────────────┘      │
│                                  4.9 ★  │
├──────────────────────────────────────────┤
│ [Product Design]            [● Live]     │
│ Design system audit & token delivery     │
│ Audit your product UI, deliver tokens.   │
│ ┌──┐ Akhil Menon · Available now         │
│ │AM│ Identity reviewed · Portfolio rev.  │
│ └──┘                                     │
├──────────────────────────────────────────┤
│ Pro fee        Delivery       Revisions  │
│ ₹25,000        10 days        2          │
│ 👁 142 views   ✉ 6 requests              │
└──────────────────────────────────────────┘
```

---

### 3. Project Presentation & Portfolios (The Deep Dive)

**UI Context:** Pro portfolio page + gig detail.

**Gallery experience:** Masonry grid (like Contra) for mixed aspect ratios, with click → full-screen lightbox.

**Rules:**
- **Grid:** 3-column masonry on desktop, 2-column on tablet, 1-column on mobile. `gap-3`. Items have `rounded-lg overflow-hidden`.
- **Item types:** image, video (native upload), external embed (YouTube/Vimeo/Figma).
- **Embeds:** Render as a 16:9 iframe card with a "Open in new tab" affordance. Never auto-load external scripts.
- **Lightbox:** Full-screen dark backdrop (`bg-black/90`). Image centered, max 90vw/90vh. Next/prev arrows + keyboard (←/→/Esc). Image zoom on click (toggle 100% → fit). Caption + project meta below.
- **Micro-interactions:** Hover on grid item → scale 1.02 + play icon overlay (videos). Click → lightbox opens at that index.
- **Featured:** Pro's featured portfolio item shows a star badge and sorts first.

---

### 4. The Vault (Secure Deliverables & Work Handoff) — v0.1 CRITICAL

**UI Context:** The contract workroom where Pros upload finished work and Buyers review it.

**v0.1 Constraint:** Since payments are manual via Admin, deliverables are shown as **Locked/Watermarked** until Admin confirms payment is cleared for that milestone.

**States:**

| State | Trigger | Visual |
|-------|---------|--------|
| **Locked (watermarked)** | Pro submitted, payment not confirmed | Blur(8px) + diagonal "QUICKQUID · PENDING PAYMENT" watermark overlay + 🔒 badge + "Awaiting payment confirmation" |
| **Under review** | Payment confirmed, Buyer reviewing | No blur, no watermark, but "Reviewing" pill + no download button |
| **Unlocked** | Buyer accepts milestone (→ payout queued) | Crisp, full-res, "Download" button enabled, ✅ badge |

**Large file handling:**
- ZIP/folders: Show as a folder icon card with file count + total size + "Contains: file1.fig, file2.png, …"
- Video: 16:9 thumbnail with play overlay; locked state shows blurred thumbnail + watermark.
- Links (Figma/GitHub): URL preview card with favicon + title + "Open link" (links are never blurred — they're external).

**The "Aha!" moment:** When Admin clears payment, the blurred/watermarked deliverable transitions (CSS `blur(8px)→blur(0)` + watermark fade-out) into a crisp, downloadable high-res file. A toast confirms "Payment confirmed — deliverable unlocked."

**ASCII wireframe — The Vault Deliverable Component:**

LOCKED state:
```
┌──────────────────────────────────────────┐
│ 🔒 M1 · Discovery & wireframes           │
│ ┌────────────────────────────────────┐   │
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│ │░ ░ QUICKQUID · PENDING PAYMENT ░ ░│   │  ← blur(8px) + watermark
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│ │░ ░ ░ ░ [blurred preview] ░ ░ ░ ░ │   │
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│ └────────────────────────────────────┘   │
│ 📁 MVP_Wireframes_v1.fig · 12.4 MB       │
│ ⏳ Awaiting payment confirmation          │
│ Pro fee ₹34,200 · Buyer total ₹39,000    │
│ [Submit payment]   [Contact support]     │  ← CTA for Buyer
└──────────────────────────────────────────┘
```

UNLOCKED state:
```
┌──────────────────────────────────────────┐
│ ✅ M1 · Discovery & wireframes           │
│ ┌────────────────────────────────────┐   │
│ │                                    │   │
│ │      [crisp, full-res preview]     │   │  ← no blur, no watermark
│ │                                    │   │
│ └────────────────────────────────────┘   │
│ 📁 MVP_Wireframes_v1.fig · 12.4 MB       │
│ ✅ Payment confirmed · Milestone accepted │
│ ⬇ Download  (12.4 MB)    [Open in Figma] │  ← download enabled
└──────────────────────────────────────────┘
```

**User flow (Pro upload → Buyer preview → unlocked download):**
1. **Pro uploads** in workroom → `EvidenceDropzone` validates (JPG/PNG/PDF/FIG/MP4/ZIP, max 100MB for deliverables) → creates `DeliveryVersion` with `status: "in_review"`, file metadata stored.
2. **Pro submits milestone** → milestone status `submitted` → Buyer sees **locked, watermarked preview** in the Vault (cannot download until payment confirmed for that milestone).
3. **Buyer submits payment evidence** (UTR) → Admin verifies → marks milestone `funded` → Buyer can now review the full preview (unblurred) but still cannot download until they **accept the milestone**.
4. **Buyer accepts milestone** → milestone status `accepted` → `payout_queued` → Vault **unlocks** → download button appears → satisfying blur→clear transition + toast.
5. **Pro** sees payout queued (not instant) — "Payout queued for Admin processing. Reference PO-XXXX."

---

### 5. User-Generated Content: Pictures in Reviews

**UI Context:** Buyer reviews with attached images of delivered work.

**Rules:**
- **Placement:** Below review text, as a horizontal row of 48px square thumbnails (max 5).
- **Upload:** At review-submit time, up to 5 images, JPG/PNG/WebP, max 5MB each.
- **Click:** Opens full-screen lightbox (same lightbox as portfolios) with next/prev.
- **Moderation:** Pro can flag a review image (→ Trust & Safety queue). Images auto-scanned for circumvention (phone/email/links) on upload.
- **Empty:** If no images, only text + rating shows (no broken image placeholders).
- **Competitor reference:** Fiverr's "Live Portfolio".

---

## PART B — PROJECT LIFECYCLE & STATUS UI (4 States, Concrete Demo Data)

**Demo context:**
- **Buyer:** Sarah L. (Startup Founder)
- **Pro:** Alex M. (Senior UI/UX Designer)
- **Project:** "5-Screen MVP Figma Wireframes"
- **Total:** $800.00 (Pro fee $800 · Buyer fee 14% = $112 · Buyer total $912)
- **Admin:** QuickQuid Operations Desk

> Note: The live prototype uses INR (₹) per the locked spec. This section uses USD ($) per the brief's demo data, but the UI patterns are identical.

---

### State 1 — STARTING (Kickoff & Manual Escrow)

**Primary User Goal:** Sarah funds the milestone; Alex sees "do not begin work yet".

**Concrete demo data:**
- Contract: QQ-5500
- Milestone M1: $400 (50% upfront)
- Sarah submitted UTR `UTR882341771` via NEFT
- Admin review target: 24 hours

**ASCII wireframe (Buyer view):**
```
┌──────────────────────────────────────────────────┐
│ ⏳ Awaiting Admin payment confirmation            │
│ Submitted UTR UTR882341771 · Target review: 24h  │
└──────────────────────────────────────────────────┘

Contract QQ-5500 · 5-Screen MVP Figma Wireframes
with Alex M. · Senior UI/UX Designer

┌─ Timeline ──────────────────────────────────────┐
│ ● 14 Jan, 09:00  Sarah requested contract        │
│ ● 14 Jan, 10:30  Alex accepted the offer         │
│ ● 14 Jan, 11:15  Sarah submitted payment (UTR)   │
│ ○ —              Awaiting Admin confirmation     │  ← pending (amber pulse)
│ ○ —              Work may begin                  │
└─────────────────────────────────────────────────┘

┌─ M1: Discovery & wireframes ───── $400 ─────────┐
│ Status: Under Admin Verification                 │
│ Pro fee $400 · Buyer fee (14%) $56 · Total $456  │
│ [View payment evidence]   [Contact support]      │
└──────────────────────────────────────────────────┘
```

**Pro view banner:** `⚠ Payment verification pending. Expected Admin review target: 24 hours. Do not begin work until payment is confirmed.`

**Admin background action:** Finance T2 opens Payment Verification queue → Bank Statement Matcher → confirms UTR matches expected amount → marks payment `confirmed` → milestone `funded` → Buyer & Pro notified → timeline advances.

---

### State 2 — ONGOING (Active Workspace & Media Handoff)

**Primary User Goal:** Alex submits watermarked drafts; Sarah reviews.

**Concrete demo data:**
- Step 2 of 3: "Drafting"
- Files: `MVP_Wireframes_v1.fig` (12.4 MB), `Concept_Sketch.jpg` (2.1 MB)

**ASCII wireframe (Active Workspace):**
```
┌─ Progress: Step 2 of 3 ──────────────────────────┐
│ ●─────●─────○  Drafting (60%)                    │
│ Kickoff  Drafting  Handoff                       │
└──────────────────────────────────────────────────┘

┌─ M1 Deliverables (locked until acceptance) ──────┐
│ 🔒 MVP_Wireframes_v1.fig         12.4 MB         │
│ ┌────────────────────────────────────────────┐   │
│ │░ ░ QUICKQUID · PENDING ACCEPTANCE ░ ░      │   │  ← watermarked preview
│ │░░░░░░ [blurred wireframe preview] ░░░░░░░░│   │
│ └────────────────────────────────────────────┘   │
│ 🔒 Concept_Sketch.jpg            2.1 MB          │
│ [blurred thumbnail]                              │
│                                                  │
│ [Accept milestone]  [Request revision]           │
└──────────────────────────────────────────────────┘

┌─ Chat ───────────────────────────────────────────┐
│ Alex: Sharing v1 wireframes for your review.     │
│      🔒 [watermarked preview inline]             │
│ Sarah: Looks great — accepting now.              │
└──────────────────────────────────────────────────┘
```

**Admin background action:** None required during active work. Admin only intervenes if a dispute is raised.

---

### State 3 — ISSUES RAISED (Dispute & Admin Mediation)

**Primary User Goal:** Sarah flags an issue; Admin mediates.

**Concrete demo data:**
- Sarah clicked "Raise issue" — category: quality/bugs
- Ticket #4092
- Mediation owner: Deepa R. (Risk T3)

**ASCII wireframe (Buyer view — warning modal):**
```
┌─ Raise an issue? ────────────────────────────────┐
│ ⚠️ This will pause the workflow and alert Admin.  │
│                                                   │
│ Category: [Quality / bugs ▾]                      │
│ Affected milestone: [M1: Discovery ▾]             │
│ What's the issue?                                 │
│ ┌─────────────────────────────────────────────┐   │
│ │ Wireframes missing the onboarding flow      │   │
│ │ agreed in acceptance criteria.              │   │
│ └─────────────────────────────────────────────┘   │
│ Desired outcome: [Partial refund ▾]               │
│                                                   │
│         [Cancel]    [Submit issue #4092]          │
└──────────────────────────────────────────────────┘
```

**Pro dashboard banner:** `⚠️ STATUS: ON HOLD — Mediation Ticket #4092. Direct dispute chat is paused while evidence is reviewed.`

**Admin control room view:**
```
┌─ Dispute #4092 · QQ-5500 ────────────────────────┐
│ Raised by: Sarah L. · Against: Alex M.           │
│ Category: Quality/bugs · Milestone: M1           │
│ SLA: 3 days remaining (normal)                   │
│                                                   │
│ ┌─ Buyer claim ──────┐ ┌─ Pro response ──────┐   │
│ │ Missing onboarding │ │ (awaiting response) │   │
│ └────────────────────┘ └─────────────────────┘   │
│                                                   │
│ [Request evidence] [Release full] [Partial refund]│
│ [Refund buyer]     [Escalate to Ops]              │
└──────────────────────────────────────────────────┘
```

**Admin background action:** Risk T3 reviews evidence → decides: release full / partial refund / refund buyer / request more info → each action creates audit event + notifies parties → if resolved, workflow resumes.

---

### State 4 — FINALIZED (Completion, Unlocking, Review)

**Primary User Goal:** Sarah accepts; Admin routes payout; Alex gets paid; both review.

**Concrete demo data:**
- Milestone M1 accepted → payout queued
- Admin processed payout: $800 − $0 commission = $800 (Pro fee) — 14% Buyer fee was paid by Sarah on top
- Payout reference: NEFT-882341005

**ASCII wireframe (The Vault transition):**
```
┌─ M1: Discovery & wireframes ─── ACCEPTED ────────┐
│                                                   │
│  BEFORE (locked):           AFTER (unlocked):     │
│  ┌─────────────────┐        ┌─────────────────┐   │
│  │░░ QUICKQUID ░░░│   →    │                 │   │
│  │░ [blurred]    ░│   →    │  [crisp hi-res] │   │  ← satisfying transition
│  │░░░░░░░░░░░░░░░░│   →    │                 │   │
│  └─────────────────┘        └─────────────────┘   │
│  🔒 Awaiting payment        ✅ Payment confirmed  │
│                             ⬇ Download (12.4 MB)  │
└──────────────────────────────────────────────────┘

┌─ Transaction receipt ────────────────────────────┐
│ Professional services            $800.00          │
│ QuickQuid commission (Pro)         $0.00          │
│ Buyer fee (14%, paid by Buyer)   $112.00          │
│ Applicable taxes         Finance review           │
│ ─────────────────────────────────────────         │
│ Payout to Alex M.                $800.00          │
│ Reference: NEFT-882341005 · Processed 15 Jan 16:20│
└──────────────────────────────────────────────────┘

┌─ Leave a review ─────────────────────────────────┐
│ Your review is private until Alex also submits.   │
│ ★★★★★  (5/5)                                    │
│ "Alex delivered clean wireframes ahead of schedule│
│  and was responsive to feedback. Highly recommend."│
│ [+ Add photos of delivered work]  (optional)      │
│ [📷] [📷] [📷]  (up to 5)                         │
│                          [Submit review]          │
└──────────────────────────────────────────────────┘
```

**Admin background action:** Finance T2 opens Payout queue → Maker confirms → Checker authorizes (if >$25k threshold) → marks `processed` → attaches bank reference → payout slip available → both parties notified → review window opens (double-blind: reviews visible after both submit or expiry).

---

## END-TO-END MEDIA FLOW SUMMARY

```
Pro uploads ─→ EvidenceDropzone validates ─→ DeliveryVersion created (in_review)
     │
     ▼
Buyer sees ─→ Vault: LOCKED (blurred + watermark) — cannot download
     │
     ▼
Buyer pays ─→ UTR submitted ─→ Admin verifies ─→ milestone funded
     │
     ▼
Buyer reviews ─→ Vault: UNBLURRED preview (still no download)
     │
     ▼
Buyer accepts ─→ milestone accepted → payout_queued
     │
     ▼
Vault UNLOCKS ─→ blur(8px)→0 transition + watermark fade ─→ Download enabled
     │         ─→ toast: "Payment confirmed — deliverable unlocked"
     ▼
Admin processes payout ─→ Pro receives payout slip ─→ Review window opens
```

**Implementation status:** The Vault component, video gig thumbnails, portfolio lightbox, and review images are implemented in the live prototype (see worklog Round 5).
