"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { PageHeader, SectionCard } from "@/components/qq/shared";
import { StatusBadge } from "@/components/qq/shared/StatusBadge";
import { VaultDeliverable, VaultDemo, type VaultFile, type VaultState } from "@/components/qq/shared/VaultDeliverable";
import { PortfolioGallery, type GalleryItem } from "@/components/qq/shared/PortfolioGallery";
import { ReviewWithImages } from "@/components/qq/shared/ReviewWithImages";
import { VideoGigCard } from "@/components/qq/shared/VideoGigCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShieldCheck, Video, Lock, CheckCircle2, Star, Play, Camera, Sparkles,
  AlertTriangle, Clock, ArrowRight, FileText, Eye,
} from "lucide-react";
import type { GigDraft } from "@/lib/qq/types";

// Demo gig for VideoGigCard showcase
const DEMO_GIG: GigDraft = {
  id: "GIG-DEMO",
  proId: "PRO-2088",
  proName: "Akhil Menon",
  title: "Design system audit & token delivery",
  category: "Product Design",
  shortDescription: "Audit your existing product UI and deliver a documented design token set.",
  coverImageColor: "#7C3AED",
  packageName: "Standard",
  proFee: 25000,
  deliveryTimeline: "10 days",
  revisions: 2,
  status: "approved_live",
  createdAt: "2025-01-09T09:00:00Z",
  views: 142,
  requests: 6,
  rating: 4.9,
  tags: [], includedItems: [], exclusions: [], deliverableFormat: "Figma + JSON",
  detailedDescription: "", buyerRequirements: [], evidence: [], availability: true, maxConcurrentOrders: 2,
  subcategory: "Design Systems",
};

const DEMO_GIG_NO_VIDEO: GigDraft = { ...DEMO_GIG, id: "GIG-DEMO2", coverImageColor: "#0891B2", title: "Partner onboarding flow design", proName: "Priya Nair", shortDescription: "End-to-end partner onboarding flow with usability testing.", proFee: 60000, deliveryTimeline: "4 weeks", rating: 4.8, views: 89, requests: 3 };

// Portfolio gallery items
const PORTFOLIO_ITEMS: GalleryItem[] = [
  { id: "p1", type: "image", title: "Partner Portal Case Study", description: "Redesigned onboarding reducing time-to-activate by 38%", color: "#7C3AED", featured: true, url: "https://example.com/case/partner-portal" },
  { id: "p2", type: "video", title: "Ops Console Walkthrough", description: "2-min walkthrough of the operations console", color: "#0891B2" },
  { id: "p3", type: "image", title: "Onboarding Flow Research", description: "12 moderated interviews synthesised into a journey map", color: "#CA8A04" },
  { id: "p4", type: "link", title: "Figma — Design Tokens", description: "Full token library in Figma", color: "#DB2777", url: "https://figma.com/file/tokens" },
  { id: "p5", type: "image", title: "Mobile Banking App", description: "iOS banking app redesign", color: "#0EA5E9" },
  { id: "p6", type: "video", title: "Prototype Demo", description: "Interactive prototype of the partner portal", color: "#7C3AED" },
];

// Vault demo files (Sarah/Alex)
const VAULT_FILES: VaultFile[] = [
  { id: "vf1", name: "MVP_Wireframes_v1.fig", type: "figma", size: "12.4 MB", thumbColor: "#7C3AED" },
  { id: "vf2", name: "Concept_Sketch.jpg", type: "image", size: "2.1 MB", thumbColor: "#0891B2" },
  { id: "vf3", name: "Final_Deliverables.zip", type: "zip", size: "48.7 MB", thumbColor: "#DB2777" },
];

export function MediaLifecycleDemo() {
  const { navigate } = useQQ();
  const [lifecycleState, setLifecycleState] = React.useState<VaultState>("locked");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media & Asset Flow Showcase"
        description="The complete visual asset blueprint — 5 media touchpoints + 4 project lifecycle states. Uses the Sarah L. (Buyer) ↔ Alex M. (Pro) demo context: '5-Screen MVP Figma Wireframes', $800.00."
        status={<Badge variant="outline"><Sparkles className="size-3 mr-1" />Design spec</Badge>}
      >
        <Button variant="outline" size="sm" onClick={() => navigate("admin_notes")}>Back to admin notes</Button>
      </PageHeader>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <FileText className="size-4 mt-0.5 text-primary shrink-0" />
          <div>
            <div className="font-medium">Full UX specification</div>
            <p className="text-muted-foreground mt-0.5">See <code className="rounded bg-muted px-1 py-0.5 text-xs">QUICKQUID_MEDIA_LIFECYCLE_SPEC.md</code> for the complete spec with ASCII wireframes for all 5 touchpoints and 4 lifecycle states.</p>
          </div>
        </div>
      </div>

      {/* ===== PART A: 5 Media Touchpoints ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">Part A — The Visual Asset Blueprint</h2>
          <Badge variant="secondary">5 touchpoints</Badge>
        </div>

        {/* Touchpoint 1: Profile Pictures */}
        <SectionCard title="1. Profile Pictures & Identity (Trust Assets)" description="Avatars on search grids, chat headers, and public profiles. 1:1 square, deterministic brand color, Verified Pro badge overlaps bottom-right.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Akhil Menon", color: "#7C3AED", size: 48, verified: true, label: "Card (48px)" },
              { name: "Priya Nair", color: "#0891B2", size: 40, verified: true, label: "Chat (40px)" },
              { name: "Rahul Verma", color: "#DB2777", size: 96, verified: true, label: "Profile hero (96px)" },
              { name: "Sara Khan", color: "#CA8A04", size: 40, verified: false, label: "Unverified (40px)" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-2 rounded-lg border border-border p-4">
                <div className="relative" style={{ width: p.size, height: p.size }}>
                  <div className="rounded-md flex items-center justify-center text-white font-medium" style={{ width: p.size, height: p.size, backgroundColor: p.color, fontSize: p.size * 0.35 }}>
                    {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  {p.verified && (
                    <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                      <ShieldCheck className="size-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Touchpoint 2: Gig Thumbnails */}
        <SectionCard title="2. Project Previews & Gig Thumbnails (The Conversion Engine)" description="16:9 cover, hover-to-preview video (muted autoplay), low-res detection. The 'Aha!' moment — Buyers see work quality without clicking.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Video className="size-3" /> With video preview (hover to play)</div>
              <VideoGigCard gig={DEMO_GIG} hasVideo views={142} requests={6} rating={4.9} />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><FileText className="size-3" /> Image-only cover</div>
              <VideoGigCard gig={DEMO_GIG_NO_VIDEO} views={89} requests={3} rating={4.8} />
            </div>
          </div>
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-3.5 inline mr-1" />
            <strong>Low-res handling:</strong> Uploads below 72 DPI or 600px show a "Low res" amber pill on the cover + warning: "This image may appear blurry to Buyers. Upload at least 1200×675."
          </div>
        </SectionCard>

        {/* Touchpoint 3: Portfolios */}
        <SectionCard title="3. Project Presentation & Portfolios (The Deep Dive)" description="Masonry grid (like Contra), click → full-screen lightbox with next/prev, zoom, keyboard nav. Supports images, native video, and YouTube/Vimeo/Figma embeds.">
          <PortfolioGallery items={PORTFOLIO_ITEMS} />
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Eye className="size-3.5" /> Click any item to open the lightbox. Use ← → arrows to navigate, click to zoom, Esc to close.
          </div>
        </SectionCard>

        {/* Touchpoint 4: The Vault */}
        <SectionCard title="4. The Vault (Secure Deliverables & Work Handoff)" description="v0.1 critical: deliverables are watermarked/locked until Admin confirms payment. The 'Aha!' moment — satisfying blur→clear transition when payment clears.">
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Demo state (Sarah/Alex, M1: $400):</span>
            {(["locked", "reviewable", "unlocked"] as VaultState[]).map((s) => (
              <Button key={s} size="sm" variant={lifecycleState === s ? "default" : "outline"} onClick={() => setLifecycleState(s)}>
                {s === "locked" ? <><Lock className="size-3 mr-1" /> Locked</> : s === "reviewable" ? <><Eye className="size-3 mr-1" /> Reviewable</> : <><CheckCircle2 className="size-3 mr-1" /> Unlocked</>}
              </Button>
            ))}
          </div>
          <VaultDeliverable
            milestoneLabel="M1"
            milestoneDescription="Discovery & wireframes"
            state={lifecycleState}
            files={VAULT_FILES}
            proFee={400}
            buyerFee={56}
            buyerTotal={456}
            payoutReference={lifecycleState === "unlocked" ? "NEFT-882341005" : undefined}
            onAccept={() => setLifecycleState("unlocked")}
            onSubmitPayment={() => setLifecycleState("reviewable")}
          />
          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2.5">
              <div className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1"><Lock className="size-3" /> Locked</div>
              <p className="text-amber-700 dark:text-amber-400/80 mt-0.5">Blur(8px) + "QUICKQUID · PENDING" watermark. No download. Buyer submits payment.</p>
            </div>
            <div className="rounded-md border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-800 p-2.5">
              <div className="font-medium text-sky-800 dark:text-sky-300 flex items-center gap-1"><Eye className="size-3" /> Reviewable</div>
              <p className="text-sky-700 dark:text-sky-400/80 mt-0.5">Payment confirmed. Full preview, no download. Buyer accepts or requests revision.</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-2.5">
              <div className="font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1"><CheckCircle2 className="size-3" /> Unlocked</div>
              <p className="text-emerald-700 dark:text-emerald-400/80 mt-0.5">Milestone accepted → payout queued. Blur→clear transition. Download enabled.</p>
            </div>
          </div>
        </SectionCard>

        {/* Touchpoint 5: Review Images */}
        <SectionCard title="5. User-Generated Content: Pictures in Reviews" description="Buyers attach up to 5 photos of delivered work. 48px thumbnails below review text, click → lightbox. Like Fiverr's 'Live Portfolio'.">
          <div className="space-y-3">
            <ReviewWithImages
              fromName="Sarah L."
              fromRole="Startup Founder · Buyer"
              avatarColor="#0F766E"
              rating={5}
              comment="Alex delivered clean wireframes ahead of schedule and was responsive to feedback. The design tokens and handoff docs were exceptional. Highly recommend."
              createdAt="2025-01-17T10:00:00Z"
              visible
              bothSubmitted
              images={[
                { id: "ri1", color: "#7C3AED", label: "Final wireframes — onboarding flow" },
                { id: "ri2", color: "#0891B2", label: "Design tokens delivered" },
                { id: "ri3", color: "#CA8A04", label: "Handoff documentation" },
              ]}
            />
            <ReviewWithImages
              fromName="Alex M."
              fromRole="Senior UI/UX Designer · Pro"
              avatarColor="#7C3AED"
              rating={5}
              comment="Clear brief, fast feedback, prompt milestone acceptance. Great client to work with."
              createdAt="2025-01-17T12:00:00Z"
              visible
              bothSubmitted
            />
          </div>
        </SectionCard>
      </div>

      {/* ===== PART B: 4 Project Lifecycle States ===== */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">Part B — Project Lifecycle & Status UI</h2>
          <Badge variant="secondary">4 states</Badge>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div className="font-medium mb-2">Demo context</div>
          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div><span className="text-muted-foreground">Buyer:</span> Sarah L. (Startup Founder)</div>
            <div><span className="text-muted-foreground">Pro:</span> Alex M. (Senior UI/UX Designer)</div>
            <div><span className="text-muted-foreground">Project:</span> 5-Screen MVP Figma Wireframes</div>
            <div><span className="text-muted-foreground">Total:</span> $800.00</div>
          </div>
        </div>

        <Tabs defaultValue="starting">
          <TabsList className="w-full sm:w-auto h-10">
            <TabsTrigger value="starting" className="gap-1.5 text-sm"><Clock className="size-4" /> Starting</TabsTrigger>
            <TabsTrigger value="ongoing" className="gap-1.5 text-sm"><Play className="size-4" /> Ongoing</TabsTrigger>
            <TabsTrigger value="issues" className="gap-1.5 text-sm"><AlertTriangle className="size-4" /> Issues</TabsTrigger>
            <TabsTrigger value="finalized" className="gap-1.5 text-sm"><CheckCircle2 className="size-4" /> Finalized</TabsTrigger>
          </TabsList>

          {/* State 1: STARTING */}
          <TabsContent value="starting" className="mt-4 space-y-4">
            <LifecycleState
              state="starting"
              title="STARTING — Kickoff & Manual Escrow"
              goal="Sarah funds the milestone; Alex sees 'do not begin work yet'."
              demoData={[
                { label: "Contract", value: "QQ-5500" },
                { label: "Milestone M1", value: "$400 (50% upfront)" },
                { label: "Sarah submitted", value: "UTR UTR882341771 via NEFT" },
                { label: "Admin review target", value: "24 hours" },
              ]}
              adminAction="Finance T2 opens Payment Verification queue → Bank Statement Matcher → confirms UTR matches expected amount → marks payment confirmed → milestone funded → Buyer & Pro notified → timeline advances."
            />
          </TabsContent>

          {/* State 2: ONGOING */}
          <TabsContent value="ongoing" className="mt-4 space-y-4">
            <LifecycleState
              state="ongoing"
              title="ONGOING — Active Workspace & Media Handoff"
              goal="Alex submits watermarked drafts; Sarah reviews."
              demoData={[
                { label: "Progress", value: "Step 2 of 3: Drafting (60%)" },
                { label: "Files", value: "MVP_Wireframes_v1.fig (12.4 MB), Concept_Sketch.jpg (2.1 MB)" },
                { label: "Milestone status", value: "Funded — work active" },
              ]}
              adminAction="None required during active work. Admin only intervenes if a dispute is raised."
            />
          </TabsContent>

          {/* State 3: ISSUES */}
          <TabsContent value="issues" className="mt-4 space-y-4">
            <LifecycleState
              state="issues"
              title="ISSUES RAISED — Dispute & Admin Mediation"
              goal="Sarah flags an issue; Admin mediates. Workflow pauses."
              demoData={[
                { label: "Ticket", value: "#4092" },
                { label: "Category", value: "Quality / bugs" },
                { label: "Raised by", value: "Sarah L. against Alex M." },
                { label: "Mediation owner", value: "Deepa R. (Risk T3)" },
                { label: "SLA", value: "3 days remaining (normal)" },
              ]}
              adminAction="Risk T3 reviews evidence → decides: release full / partial refund / refund buyer / request more info → each action creates audit event + notifies parties → if resolved, workflow resumes."
            />
          </TabsContent>

          {/* State 4: FINALIZED */}
          <TabsContent value="finalized" className="mt-4 space-y-4">
            <LifecycleState
              state="finalized"
              title="FINALIZED — Completion, Unlocking, and Review"
              goal="Sarah accepts; Admin routes payout; Alex gets paid; both review."
              demoData={[
                { label: "Milestone", value: "M1 accepted → payout queued" },
                { label: "Payout", value: "$800 − $0 commission = $800 (Pro fee)" },
                { label: "Reference", value: "NEFT-882341005 · Processed 15 Jan 16:20" },
                { label: "Review window", value: "Open — double-blind until both submit" },
              ]}
              adminAction="Finance T2 opens Payout queue → Maker confirms → Checker authorizes (if >$25k) → marks processed → attaches bank reference → payout slip available → both parties notified → review window opens."
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* End-to-end flow */}
      <SectionCard title="End-to-end media flow" description="From Pro upload to Buyer unlocked download.">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            "Pro uploads",
            "Watermarked preview",
            "Buyer pays (UTR)",
            "Admin verifies",
            "Milestone funded",
            "Buyer reviews (unblurred)",
            "Buyer accepts",
            "Vault unlocks (blur→clear)",
            "Download enabled",
            "Admin processes payout",
            "Review window opens",
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium">{step}</span>
              {i < arr.length - 1 && <ArrowRight className="size-3 text-muted-foreground shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function LifecycleState({ state, title, goal, demoData, adminAction }: {
  state: "starting" | "ongoing" | "issues" | "finalized";
  title: string;
  goal: string;
  demoData: { label: string; value: string }[];
  adminAction: string;
}) {
  const tone = state === "starting" ? "warning" : state === "ongoing" ? "info" : state === "issues" ? "critical" : "success";
  const Icon = state === "starting" ? Clock : state === "ongoing" ? Play : state === "issues" ? AlertTriangle : CheckCircle2;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`flex size-9 items-center justify-center rounded-lg ${
          tone === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          : tone === "info" ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
          : tone === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
        }`}>
          <Icon className="size-4.5" />
        </div>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{goal}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Concrete demo data</div>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          {demoData.map((d) => (
            <div key={d.label} className="flex items-start gap-2">
              <dt className="text-muted-foreground shrink-0 min-w-[120px]">{d.label}:</dt>
              <dd className="font-medium">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Admin background action (v0.1 manual)
        </div>
        <p className="text-sm text-foreground/80">{adminAction}</p>
      </div>
    </div>
  );
}
