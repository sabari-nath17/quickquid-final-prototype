"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  User, Role, ProProfile, BuyerProfile, Brief, Proposal, Contract,
  PaymentEvidence, Payout, Refund, Dispute, Review, SupportTicket,
  NotificationItem, AuditEvent, KycSubmission, GigDraft, OfflineInstrument,
  TrustSafetyCase, ViewName, ViewParams, VerificationStatus, MilestoneStatus,
  PaymentEvidenceStatus, PayoutStatus, ContractStatus, DisputeStatus,
  PriorityBoost, GuestReadinessDraft,
} from "./types";
import {
  SEED_USERS, SEED_PRO_PROFILES, SEED_BUYER_PROFILES, SEED_BRIEFS,
  SEED_PROPOSALS, SEED_CONTRACTS, SEED_PAYMENTS, SEED_PAYOUTS, SEED_REFUNDS,
  SEED_DISPUTES, SEED_REVIEWS, SEED_TICKETS, SEED_NOTIFICATIONS, SEED_AUDIT,
  SEED_KYC, SEED_GIGS, SEED_OFFLINE_INSTRUMENTS, SEED_TRUST_CASES, ADMIN_NOTES,
  SEED_PRIORITY_BOOSTS,
} from "./seed";
import { buyerFee, genId } from "./format";

export interface Message {
  id: string;
  contractId: string;
  from: "buyer" | "pro" | "system";
  fromName: string;
  text: string;
  at: string;
  blocked?: string[];
}

export interface ScopeChange {
  id: string;
  contractId: string;
  requestedChange: string;
  feeDelta: number;
  timelineDelta: string;
  criteriaImpact: string;
  reason: string;
  status: "pending" | "accepted" | "declined" | "changes_requested";
  proposedBy: "buyer" | "pro";
  at: string;
}

export interface NavigationEntry {
  view: ViewName;
  params: ViewParams;
}

export interface NavigationOptions {
  replace?: boolean;
}

function sameRoute(a: NavigationEntry, b: NavigationEntry) {
  return a.view === b.view && JSON.stringify(a.params) === JSON.stringify(b.params);
}

function roleHome(role: Role): ViewName {
  if (role === "buyer") return "buyer_dashboard";
  if (role === "pro") return "pro_dashboard";
  if (role === "admin_support" || role === "finance" || role === "risk" || role === "ops_manager") return "admin_operations";
  return "role_selection";
}

interface QQState {
  hydrated: boolean;
  // session
  currentRole: Role;
  currentUserId: string | null;
  view: ViewName;
  viewParams: ViewParams;
  navigationStack: NavigationEntry[];
  canGoBack: boolean;
  navigationGuard: (() => boolean) | null;
  // data
  users: User[];
  proProfiles: ProProfile[];
  buyerProfiles: BuyerProfile[];
  briefs: Brief[];
  proposals: Proposal[];
  contracts: Contract[];
  payments: PaymentEvidence[];
  payouts: Payout[];
  refunds: Refund[];
  disputes: Dispute[];
  reviews: Review[];
  tickets: SupportTicket[];
  notifications: NotificationItem[];
  audit: AuditEvent[];
  kyc: KycSubmission[];
  gigs: GigDraft[];
  offlineInstruments: OfflineInstrument[];
  trustCases: TrustSafetyCase[];
  messages: Message[];
  scopeChanges: ScopeChange[];
  adminNotes: string[];
  // consent
  consent: { terms: boolean; privacy: boolean; workRelationship: boolean; version: string; ts: string };
  // ui
  notificationDrawerOpen: boolean;
  supportWidgetOpen: boolean;
  mobileSidebarOpen: boolean;
  kycModalOpen: boolean;

  // actions
  setHydrated: () => void;
  switchRole: (role: Role) => void;
  signInAs: (userId: string) => void;
  createAccount: (email: string, role: "buyer" | "pro") => string;
  navigate: (view: ViewName, params?: ViewParams, options?: NavigationOptions) => void;
  goBack: () => void;
  setNavigationGuard: (guard: (() => boolean) | null) => void;
  setNotificationDrawer: (open: boolean) => void;
  setSupportWidget: (open: boolean) => void;
  setMobileSidebar: (open: boolean) => void;
  setKycModal: (open: boolean) => void;
  setConsent: (c: Partial<QQState["consent"]>) => void;

  // data mutations
  upsertBrief: (brief: Brief) => void;
  submitProposal: (p: Proposal) => void;
  updateProposal: (id: string, patch: Partial<Proposal>) => void;
  createContract: (c: Contract) => void;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  updateMilestone: (contractId: string, milestoneId: string, patch: Partial<Contract["milestones"][0]>) => void;
  submitPaymentEvidence: (p: PaymentEvidence) => void;
  updatePayment: (id: string, patch: Partial<PaymentEvidence>) => void;
  queuePayout: (p: Payout) => void;
  updatePayout: (id: string, patch: Partial<Payout>) => void;
  requestRefund: (r: Refund) => void;
  updateRefund: (id: string, patch: Partial<Refund>) => void;
  openDispute: (d: Dispute) => void;
  updateDispute: (id: string, patch: Partial<Dispute>) => void;
  addReview: (r: Review) => void;
  updateReview: (id: string, patch: Partial<Review>) => void;
  createTicket: (t: SupportTicket) => void;
  addTicketMessage: (id: string, from: "user" | "admin", text: string) => void;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addAudit: (e: Omit<AuditEvent, "id" | "timestamp">) => void;
  updateKyc: (id: string, patch: Partial<KycSubmission>) => void;
  updateUserVerification: (userId: string, status: VerificationStatus, verifiedBy?: string) => void;
  reviewSkillVerification: (userId: string, skill: string, status: "approved" | "rejected", reviewerNote?: string) => void;
  upsertGig: (g: GigDraft) => void;
  updateGig: (id: string, patch: Partial<GigDraft>) => void;
  priorityBoosts: PriorityBoost[];
  submitPriorityBoost: (pb: PriorityBoost) => void;
  updatePriorityBoost: (id: string, patch: Partial<PriorityBoost>) => void;
  updateOfflineInstrument: (id: string, patch: Partial<OfflineInstrument>) => void;
  updateTrustCase: (id: string, patch: Partial<TrustSafetyCase>) => void;
  addMessage: (m: Message) => void;
  addScopeChange: (s: ScopeChange) => void;
  updateScopeChange: (id: string, patch: Partial<ScopeChange>) => void;
  updateProProfile: (userId: string, patch: Partial<ProProfile>) => void;
  updateBuyerProfile: (userId: string, patch: Partial<BuyerProfile>) => void;
  resetData: () => void;
  normalizeSlaTimestamps: () => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  guestDraft: GuestReadinessDraft | null;
  setGuestDraft: (draft: GuestReadinessDraft | null) => void;
  buyerOnboardingComplete: boolean;
  setBuyerOnboardingComplete: (complete: boolean) => void;
}

const initialState = {
  currentRole: "visitor" as Role,
  currentUserId: null as string | null,
  view: "role_selection" as ViewName,
  viewParams: {} as ViewParams,
  navigationStack: [] as NavigationEntry[],
  canGoBack: false,
  navigationGuard: null as (() => boolean) | null,
  users: SEED_USERS,
  proProfiles: SEED_PRO_PROFILES,
  buyerProfiles: SEED_BUYER_PROFILES,
  briefs: SEED_BRIEFS,
  proposals: SEED_PROPOSALS,
  contracts: SEED_CONTRACTS,
  payments: SEED_PAYMENTS,
  payouts: SEED_PAYOUTS,
  refunds: SEED_REFUNDS,
  disputes: SEED_DISPUTES,
  reviews: SEED_REVIEWS,
  tickets: SEED_TICKETS,
  notifications: SEED_NOTIFICATIONS,
  audit: SEED_AUDIT,
  kyc: SEED_KYC,
  gigs: SEED_GIGS,
  offlineInstruments: SEED_OFFLINE_INSTRUMENTS,
  trustCases: SEED_TRUST_CASES,
  priorityBoosts: SEED_PRIORITY_BOOSTS,
  messages: [
    // === Workflow 1: QQ-0892 — Early conversation (funding pending, Pro can't start yet) ===
    { id: "MSG-1", contractId: "QQ-0892", from: "system", fromName: "QuickQuid", text: "Contract QQ-0892 accepted by both parties. Funding pending for M1 (₹34,200). Pro should not begin work until payment is confirmed.", at: "2025-01-14T09:05:00Z" },
    { id: "MSG-2", contractId: "QQ-0892", from: "buyer", fromName: "Northstar Labs", text: "Hi Akhil! Excited to get started on the partner portal. I'm submitting the M1 payment via NEFT now. UTR will be UTR982341771.", at: "2025-01-14T11:30:00Z" },
    { id: "MSG-3", contractId: "QQ-0892", from: "buyer", fromName: "Northstar Labs", text: "A quick question while we wait for verification — for the discovery phase, would you prefer a async Slack thread or a 60-min kickoff call? I can do either.", at: "2025-01-14T11:35:00Z" },
    { id: "MSG-4", contractId: "QQ-0892", from: "pro", fromName: "Akhil Menon", text: "Hi Northstar team! Thanks — I'd prefer a 60-min kickoff call to align on stakeholders, success metrics, and the 3 priority screens. Once payment is confirmed I'll send a calendar invite.", at: "2025-01-14T12:00:00Z" },
    { id: "MSG-5", contractId: "QQ-0892", from: "pro", fromName: "Akhil Menon", text: "Also, I'll need access to your current portal (staging URL) and any existing user research. Can you share those after the kickoff?", at: "2025-01-14T12:02:00Z" },
    { id: "MSG-6", contractId: "QQ-0892", from: "buyer", fromName: "Northstar Labs", text: "Perfect. I'll prep the staging access and our last usability test results. Talk soon!", at: "2025-01-14T12:15:00Z" },

    // === Workflow 2: QQ-0730 — Mid-milestone (active work, Pro submitted, Buyer reviewing) ===
    { id: "MSG-7", contractId: "QQ-0730", from: "system", fromName: "QuickQuid", text: "Contract QQ-0730 active. M1 (Script + recruitment) accepted. Payment confirmed. Work may begin on M2.", at: "2025-01-10T10:00:00Z" },
    { id: "MSG-8", contractId: "QQ-0730", from: "pro", fromName: "Akhil Menon", text: "Great — M1 is done. I've confirmed all 12 participants for the interviews. I'll start the first batch of 6 interviews this week and the remaining 6 next week.", at: "2025-01-10T14:00:00Z" },
    { id: "MSG-9", contractId: "QQ-0730", from: "buyer", fromName: "Northstar Labs", text: "Excellent. Can you make sure to include 3 enterprise partners and 3 SMB partners in the mix? We want to capture both segments.", at: "2025-01-10T15:00:00Z" },
    { id: "MSG-10", contractId: "QQ-0730", from: "pro", fromName: "Akhil Menon", text: "Done — 6 enterprise, 4 SMB, 2 mid-market. I'll start synthesis after interview 8 and share a preliminary journey map.", at: "2025-01-11T09:00:00Z" },
    { id: "MSG-11", contractId: "QQ-0730", from: "pro", fromName: "Akhil Menon", text: "Update: All 12 interviews completed. I've uploaded the journey map v1 + interview summaries to the Vault (v1). Please review when you get a chance — I'd love feedback on the top 5 insights before I finalise the report.", at: "2025-01-18T14:00:00Z" },
    { id: "MSG-12", contractId: "QQ-0730", from: "buyer", fromName: "Northstar Labs", text: "Will review today. Quick question — insight #3 mentions 'partners find onboarding confusing' — can you share which 3 partners said this specifically? Want to follow up internally.", at: "2025-01-18T16:00:00Z" },
    { id: "MSG-13", contractId: "QQ-0730", from: "pro", fromName: "Akhil Menon", text: "Sure — it was participants 2, 7, and 11 (all enterprise). I've annotated those in the journey map. Let me know if the insight framing works or if you'd like me to reframe it.", at: "2025-01-18T16:30:00Z" },

    // === Workflow 3: QQ-0680 — Completed + review (work done, both parties happy, reviews exchanged) ===
    { id: "MSG-14", contractId: "QQ-0680", from: "system", fromName: "QuickQuid", text: "Contract QQ-0680 — all milestones accepted. Payout processed (ref NEFT-882341005). Review window is now open.", at: "2025-01-17T10:00:00Z" },
    { id: "MSG-15", contractId: "QQ-0680", from: "buyer", fromName: "Northstar Labs", text: "Akhil, just wanted to say — the ops console redesign exceeded our expectations. The design tokens alone saved our team 2 weeks of engineering work. The handoff docs were the best we've received from any designer.", at: "2025-01-17T10:30:00Z" },
    { id: "MSG-16", contractId: "QQ-0680", from: "pro", fromName: "Akhil Menon", text: "Thank you so much! That means a lot. The team was great to work with — fast feedback loops and clear stakeholder alignment made this smooth.", at: "2025-01-17T11:00:00Z" },
    { id: "MSG-17", contractId: "QQ-0680", from: "buyer", fromName: "Northstar Labs", text: "We'd love to rehire you for the next phase (implementation handoff). I'll create a private brief next week. Would 4 weeks timeline work for you?", at: "2025-01-17T11:30:00Z" },
    { id: "MSG-18", contractId: "QQ-0680", from: "pro", fromName: "Akhil Menon", text: "Absolutely — I have capacity starting Feb 1. Looking forward to it! I've also submitted my review. Let's keep in touch.", at: "2025-01-17T12:00:00Z" },

    // === Workflow 4a: QQ-0725 — Dispute 1 (scope dispute — filter states) ===
    { id: "MSG-19", contractId: "QQ-0725", from: "system", fromName: "QuickQuid", text: "Contract QQ-0725 active. M1 (Discovery + audit) accepted. Work may begin on M2.", at: "2025-01-08T10:00:00Z" },
    { id: "MSG-20", contractId: "QQ-0725", from: "pro", fromName: "Priya Nair", text: "Hi team — I've started on the dashboard audit. I'll focus on the 8 key screens we identified. Should have the first draft by end of week.", at: "2025-01-08T14:00:00Z" },
    { id: "MSG-21", contractId: "QQ-0725", from: "buyer", fromName: "Northstar Labs", text: "Great. We're particularly interested in the filter states (active, empty, loading) and the data table interactions. Make sure those are covered.", at: "2025-01-08T15:00:00Z" },
    { id: "MSG-22", contractId: "QQ-0725", from: "pro", fromName: "Priya Nair", text: "Got it — I'll include those in v1.", at: "2025-01-08T15:30:00Z" },
    { id: "MSG-23", contractId: "QQ-0725", from: "pro", fromName: "Priya Nair", text: "Hi-fi v1 is uploaded to the Vault. 8 screens covering the main dashboard, analytics, and settings.", at: "2025-01-15T10:00:00Z" },
    { id: "MSG-24", contractId: "QQ-0725", from: "buyer", fromName: "Northstar Labs", text: "The designs look clean overall, but I don't see the filter active/empty/loading states we discussed. These are essential for the dashboard to be usable. The acceptance criteria says 'All 8 screens approved' — these states are part of that.", at: "2025-01-15T12:00:00Z" },
    { id: "MSG-25", contractId: "QQ-0725", from: "pro", fromName: "Priya Nair", text: "I understand the concern, but the filter states weren't explicitly listed in the acceptance criteria document. The criteria says '8 screens' and 'design tokens documented' — the filter states would be additional screens. I can add them for ₹5,000.", at: "2025-01-15T13:00:00Z" },
    { id: "MSG-26", contractId: "QQ-0725", from: "buyer", fromName: "Northstar Labs", text: "That's not acceptable. We clearly discussed this in the kickoff. The filter states are implied by 'All 8 screens approved' — you can't approve a screen without its states. I'm raising a dispute.", at: "2025-01-16T13:30:00Z" },
    { id: "MSG-27", contractId: "QQ-0725", from: "system", fromName: "QuickQuid", text: "⚠️ Dispute DSP-7002 opened by Northstar Labs (category: scope). Direct dispute chat is paused while evidence is reviewed. Risk team has been notified.", at: "2025-01-16T14:00:00Z" },

    // === Workflow 4b: QQ-0735 — Dispute 2 (communication + timeline) ===
    { id: "MSG-28", contractId: "QQ-0735", from: "system", fromName: "QuickQuid", text: "Contract QQ-0735 active. M1 (Audit + plan) funded. Work may begin.", at: "2025-01-08T09:00:00Z" },
    { id: "MSG-29", contractId: "QQ-0735", from: "pro", fromName: "Akhil Menon", text: "I'll need access to your design system, component library, and the last 3 sprint review decks to start the audit.", at: "2025-01-08T10:00:00Z" },
    { id: "MSG-30", contractId: "QQ-0735", from: "buyer", fromName: "Northstar Labs", text: "Will share access today. The design system is in Figma — I'll add you as a viewer.", at: "2025-01-08T11:00:00Z" },
    { id: "MSG-31", contractId: "QQ-0735", from: "buyer", fromName: "Northstar Labs", text: "Access shared. Also — make sure the 30/60/90 plan includes a design system governance section. We discussed this in the kickoff.", at: "2025-01-08T16:00:00Z" },
    { id: "MSG-32", contractId: "QQ-0735", from: "pro", fromName: "Akhil Menon", text: "Got it. Working on it now.", at: "2025-01-09T09:00:00Z" },
    { id: "MSG-33", contractId: "QQ-0735", from: "buyer", fromName: "Northstar Labs", text: "Hi Akhil — the audit was due yesterday. Can you share an update? I haven't heard from you in 3 days.", at: "2025-01-15T09:00:00Z" },
    { id: "MSG-34", contractId: "QQ-0735", from: "buyer", fromName: "Northstar Labs", text: "I'm raising a dispute. The audit was delivered 5 days late and it's missing the design system governance section we discussed. I've been trying to reach you for 3 days.", at: "2025-01-15T09:05:00Z" },
    { id: "MSG-35", contractId: "QQ-0735", from: "system", fromName: "QuickQuid", text: "⚠️ Dispute DSP-7003 opened by Northstar Labs (category: communication). Direct dispute chat is paused. Risk team has been notified. SLA: 5 days to acknowledge.", at: "2025-01-15T09:10:00Z" },

    // === Workflow 5: QQ-0710 — Brand identity (active work, different buyer: Verdant Retail) ===
    { id: "MSG-36", contractId: "QQ-0710", from: "system", fromName: "QuickQuid", text: "Contract QQ-0710 active. M1 (Logo concepts) accepted. Work may begin on M2.", at: "2025-01-10T10:00:00Z" },
    { id: "MSG-37", contractId: "QQ-0710", from: "pro", fromName: "Rahul Verma", text: "Hi Verdant team! I've shared 3 logo concepts in the Vault. Concept A is modern/minimal, B is bold/expressive, C is classic/timeless. Which direction resonates?", at: "2025-01-12T14:00:00Z" },
    { id: "MSG-38", contractId: "QQ-0710", from: "buyer", fromName: "Verdant Retail", text: "We love Concept B — the bold/expressive direction. Can you refine it with our brand green (#15803D) and try a version with the tagline?", at: "2025-01-12T16:00:00Z" },
    { id: "MSG-39", contractId: "QQ-0710", from: "pro", fromName: "Rahul Verma", text: "Great choice! I'll refine Concept B with the green and tagline. Should have v2 in the Vault by Thursday.", at: "2025-01-13T09:00:00Z" },
    { id: "MSG-40", contractId: "QQ-0710", from: "pro", fromName: "Rahul Verma", text: "Update: Color + type system v1 is uploaded. I've paired the logo with Inter (headings) and DM Sans (body). Let me know if the type pairing works.", at: "2025-01-18T10:00:00Z" },
    { id: "MSG-41", contractId: "QQ-0710", from: "buyer", fromName: "Verdant Retail", text: "The color palette looks great. The type pairing is clean — but can we try a serif for headings? Something with more personality. Maybe Fraunces or Recoleta?", at: "2025-01-18T14:00:00Z" },
    { id: "MSG-42", contractId: "QQ-0710", from: "pro", fromName: "Rahul Verma", text: "Sure — I'll mock up both Fraunces and Recoleta options and share them tomorrow. Good call on adding more personality.", at: "2025-01-18T15:00:00Z" },
  ] as Message[],
  scopeChanges: [] as ScopeChange[],
  adminNotes: ADMIN_NOTES,
  consent: { terms: false, privacy: false, workRelationship: false, version: "v0.1", ts: "" },
  notificationDrawerOpen: false,
  supportWidgetOpen: false,
  mobileSidebarOpen: false,
  kycModalOpen: false,
  theme: "light" as "light" | "dark",
  commandOpen: false,
  guestDraft: null as GuestReadinessDraft | null,
  buyerOnboardingComplete: false,
};

export const useQQ = create<QQState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialState,

      setHydrated: () => set({ hydrated: true }),
      switchRole: (role) => {
        const user = get().users.find((u) => u.role === role);
        set({
          currentRole: role,
          currentUserId: user?.id ?? null,
          view: role === "visitor" ? "role_selection" : role === "buyer" ? "buyer_dashboard" : role === "pro" ? "pro_dashboard" : role === "admin_support" ? "admin_operations" : role === "finance" ? "admin_payouts" : role === "risk" ? "admin_trust" : role === "ops_manager" ? "admin_operations" : "role_selection",
          viewParams: {},
          navigationStack: [],
          canGoBack: false,
        });
      },
      signInAs: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return;
        const role = user.role;
        set({
          currentRole: role,
          currentUserId: userId,
          view: role === "buyer" ? "buyer_dashboard" : role === "pro" ? "pro_dashboard" : role === "admin_support" ? "admin_operations" : role === "finance" ? "admin_payouts" : role === "risk" ? "admin_trust" : role === "ops_manager" ? "admin_operations" : "readiness",
          viewParams: {},
          navigationStack: [],
          canGoBack: false,
        });
      },
      createAccount: (email, role) => {
        const id = genId(role === "buyer" ? "BUY" : "PRO");
        const displayName = email.split("@")[0].split(/[._-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || (role === "buyer" ? "New Buyer" : "New Pro");
        const user: User = {
          id,
          role,
          name: displayName,
          email: email.trim().toLowerCase(),
          headline: role === "buyer" ? "New client account" : "New professional account",
          avatarColor: role === "buyer" ? "#0F766E" : "#4E62D8",
          verification: "Verification not started",
          verificationStatus: "not_started",
        };
        set((state) => ({
          users: [user, ...state.users],
          buyerProfiles: role === "buyer" ? [{
            userId: id,
            displayName,
            companyDescription: "",
            industry: "",
            hiringCategories: [],
            publicVisibility: false,
          }, ...state.buyerProfiles] : state.buyerProfiles,
          proProfiles: role === "pro" ? [{
            userId: id,
            displayName,
            headline: "",
            bio: "",
            primaryCategory: "",
            skills: [],
            skillVerifications: [],
            externalLinks: [],
            onboardingStatus: "not_started",
            portfolioItems: [],
            availability: "paused",
            responseTime: "Not set",
            preferredProjectSize: "Not set",
            preferredTimeline: "Not set",
            languages: ["English"],
            timeZone: "IST (UTC+5:30)",
            publicVisibility: false,
            trustSignals: [],
            completedProjects: 0,
            rating: 0,
            responseTimeHours: 0,
            payoutReadiness: "not_started",
          }, ...state.proProfiles] : state.proProfiles,
          currentRole: role,
          currentUserId: id,
          view: "readiness",
          viewParams: {},
          navigationStack: [],
          canGoBack: false,
        }));
        return id;
      },
      navigate: (view, params, options) => {
        const current = { view: get().view, params: get().viewParams };
        const next = { view, params: params ?? {} };
        if (sameRoute(current, next)) return;
        const stack = options?.replace ? get().navigationStack : [...get().navigationStack, current];
        set({ view, viewParams: next.params, navigationStack: stack.slice(-50), canGoBack: stack.length > 0, mobileSidebarOpen: false });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      goBack: () => {
        const state = get();
        if (state.navigationGuard && !state.navigationGuard()) return;
        const stack = [...state.navigationStack];
        const previous = stack.pop();
        const fallback = roleHome(state.currentRole);
        const target = previous ?? { view: fallback, params: {} };
        set({ view: target.view, viewParams: target.params, navigationStack: stack, canGoBack: stack.length > 0, mobileSidebarOpen: false });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      setNavigationGuard: (guard) => set({ navigationGuard: guard }),
      setNotificationDrawer: (open) => set({ notificationDrawerOpen: open }),
      setSupportWidget: (open) => set({ supportWidgetOpen: open }),
      setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
      setKycModal: (open) => set({ kycModalOpen: open }),
      setConsent: (c) => set((s) => ({ consent: { ...s.consent, ...c, ts: new Date().toISOString() } })),

      upsertBrief: (brief) => set((s) => {
        const idx = s.briefs.findIndex((b) => b.id === brief.id);
        const next = idx >= 0 ? s.briefs.map((b) => (b.id === brief.id ? brief : b)) : [brief, ...s.briefs];
        return { briefs: next };
      }),
      submitProposal: (p) => set((s) => ({ proposals: [p, ...s.proposals] })),
      updateProposal: (id, patch) => set((s) => ({ proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      createContract: (c) => set((s) => ({ contracts: [c, ...s.contracts] })),
      updateContract: (id, patch) => set((s) => ({ contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      updateMilestone: (contractId, milestoneId, patch) => set((s) => ({
        contracts: s.contracts.map((c) => c.id !== contractId ? c : { ...c, milestones: c.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)) }),
      })),
      submitPaymentEvidence: (p) => set((s) => ({ payments: [p, ...s.payments] })),
      updatePayment: (id, patch) => set((s) => ({ payments: s.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      queuePayout: (p) => set((s) => ({ payouts: [p, ...s.payouts] })),
      updatePayout: (id, patch) => set((s) => ({ payouts: s.payouts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      requestRefund: (r) => set((s) => ({ refunds: [r, ...s.refunds] })),
      updateRefund: (id, patch) => set((s) => ({ refunds: s.refunds.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      openDispute: (d) => set((s) => ({ disputes: [d, ...s.disputes] })),
      updateDispute: (id, patch) => set((s) => ({ disputes: s.disputes.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      addReview: (r) => set((s) => ({ reviews: [...s.reviews, r] })),
      updateReview: (id, patch) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      createTicket: (t) => set((s) => ({ tickets: [t, ...s.tickets] })),
      addTicketMessage: (id, from, text) => set((s) => ({
        tickets: s.tickets.map((t) => t.id === id ? { ...t, messages: [...t.messages, { from, text, at: new Date().toISOString() }] } : t),
      })),
      updateTicket: (id, patch) => set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addAudit: (e) => set((s) => ({ audit: [{ ...e, id: genId("A"), timestamp: new Date().toISOString() }, ...s.audit] })),
      updateKyc: (id, patch) => set((s) => {
        const existing = s.kyc.find((submission) => submission.id === id);
        return { kyc: existing ? s.kyc.map((submission) => submission.id === id ? { ...submission, ...patch } : submission) : [{ id, ...patch } as KycSubmission, ...s.kyc] };
      }),
      updateUserVerification: (userId, status, verifiedBy) => set((s) => ({
        users: s.users.map((user) => user.id === userId ? {
          ...user,
          verificationStatus: status,
          verification: status === "approved" ? "QuickQuid Verified" : status === "rejected" ? "Verification rejected" : "Verification under review",
          verifiedAt: status === "approved" ? new Date().toISOString() : undefined,
          verifiedBy: status === "approved" ? verifiedBy : undefined,
        } : user),
      })),
      reviewSkillVerification: (userId, skill, status, reviewerNote) => set((s) => {
        const reviewedAt = new Date().toISOString();
        const reviewer = s.currentUserId ?? "QuickQuid Admin";
        const proProfiles = s.proProfiles.map((profile) => {
          if (profile.userId !== userId) return profile;
          const existing = profile.skillVerifications ?? profile.skills.map((item) => ({
            skill: item,
            evidence: "Portfolio and profile evidence",
            status: "under_review" as VerificationStatus,
            submittedAt: new Date().toISOString(),
          }));
          return {
            ...profile,
            skillVerifications: existing.map((item) => item.skill === skill ? {
              ...item,
              status,
              reviewedAt,
              reviewedBy: reviewer,
              reviewerNote,
            } : item),
          };
        });
        const approvedSkill = proProfiles.find((profile) => profile.userId === userId)?.skillVerifications?.some((item) => item.status === "approved") ?? false;
        const approvedIdentity = s.kyc.some((submission) => submission.userId === userId && submission.status === "approved");
        return {
          proProfiles: proProfiles.map((profile) => profile.userId === userId ? {
            ...profile,
            onboardingStatus: approvedSkill && approvedIdentity ? "approved" : profile.onboardingStatus,
          } : profile),
          users: s.users.map((user) => user.id === userId ? {
            ...user,
            verificationStatus: approvedSkill && approvedIdentity ? "approved" : user.verificationStatus,
            verification: approvedSkill && approvedIdentity ? "QuickQuid Verified" : user.verification,
            verifiedAt: approvedSkill && approvedIdentity ? reviewedAt : user.verifiedAt,
            verifiedBy: approvedSkill && approvedIdentity ? reviewer : user.verifiedBy,
          } : user),
        };
      }),
      upsertGig: (g) => set((s) => {
        const idx = s.gigs.findIndex((x) => x.id === g.id);
        return { gigs: idx >= 0 ? s.gigs.map((x) => (x.id === g.id ? g : x)) : [g, ...s.gigs] };
      }),
      updateGig: (id, patch) => set((s) => ({ gigs: s.gigs.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      submitPriorityBoost: (pb) => set((s) => ({ priorityBoosts: [pb, ...s.priorityBoosts] })),
      updatePriorityBoost: (id, patch) => set((s) => ({ priorityBoosts: s.priorityBoosts.map((pb) => (pb.id === id ? { ...pb, ...patch } : pb)) })),
      updateOfflineInstrument: (id, patch) => set((s) => ({ offlineInstruments: s.offlineInstruments.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      updateTrustCase: (id, patch) => set((s) => ({ trustCases: s.trustCases.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      addScopeChange: (sc) => set((s) => ({ scopeChanges: [...s.scopeChanges, sc] })),
      updateScopeChange: (id, patch) => set((s) => ({ scopeChanges: s.scopeChanges.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      updateProProfile: (userId, patch) => set((s) => ({ proProfiles: s.proProfiles.map((p) => (p.userId === userId ? { ...p, ...patch } : p)) })),
      updateBuyerProfile: (userId, patch) => set((s) => ({ buyerProfiles: s.buyerProfiles.map((b) => (b.userId === userId ? { ...b, ...patch } : b)) })),
      resetData: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("quickquid-v0.1");
            localStorage.removeItem("quickquid-tour-completed-v1");
          } catch { /* ignore */ }
        }
        set({ ...initialState, hydrated: true });
      },
      normalizeSlaTimestamps: () => set((s) => {
        // Shift all timestamps forward so SLA timers show realistic normal/approaching/breached states relative to now.
        const now = Date.now();
        const shift = (iso: string, hoursAgo: number) => new Date(now - hoursAgo * 3600000).toISOString();
        return {
          kyc: s.kyc.map((k) => ({
            ...k,
            submittedAt: shift(k.submittedAt, k.status === "under_review" ? 3 : 48),
            resolvedAt: k.resolvedAt ? shift(k.resolvedAt, 2) : undefined,
          })),
          payments: s.payments.map((p) => ({
            ...p,
            submittedAt: shift(p.submittedAt, p.status === "under_admin_verification" ? 3 : 30),
            date: shift(p.date, p.status === "under_admin_verification" ? 3 : 30),
            resolvedAt: p.resolvedAt ? shift(p.resolvedAt, 20) : undefined,
          })),
          payouts: s.payouts.map((p) => ({
            ...p,
            queuedAt: shift(p.queuedAt, p.status === "queued" ? 6 : p.status === "processed" ? 72 : 40),
            processedAt: p.processedAt ? shift(p.processedAt, 60) : undefined,
          })),
          refunds: s.refunds.map((r) => ({ ...r, createdAt: shift(r.createdAt, r.status === "requested" ? 8 : 50), executedAt: r.executedAt ? shift(r.executedAt, 40) : undefined })),
          disputes: s.disputes.map((d) => ({ ...d, createdAt: shift(d.createdAt, d.status === "opened" ? 2 : 80), slaOpenedAt: shift(d.slaOpenedAt, d.status === "opened" ? 2 : 80) })),
          trustCases: s.trustCases.map((t) => ({ ...t, createdAt: shift(t.createdAt, 5) })),
          tickets: s.tickets.map((t) => ({ ...t, createdAt: shift(t.createdAt, 4) })),
          notifications: s.notifications.map((n) => ({ ...n, createdAt: shift(n.createdAt, 1) })),
        };
      }),
      theme: "light",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      commandOpen: false,
  guestDraft: null as GuestReadinessDraft | null,
  buyerOnboardingComplete: false,
      setCommandOpen: (open) => set({ commandOpen: open }),
      setGuestDraft: (draft) => set({ guestDraft: draft }),
      setBuyerOnboardingComplete: (complete) => set({ buyerOnboardingComplete: complete }),
    }),
    {
      name: "quickquid-v0.1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (s) => ({
        currentRole: s.currentRole,
        currentUserId: s.currentUserId,
        users: s.users,
        proProfiles: s.proProfiles,
        buyerProfiles: s.buyerProfiles,
        briefs: s.briefs,
        proposals: s.proposals,
        contracts: s.contracts,
        payments: s.payments,
        payouts: s.payouts,
        refunds: s.refunds,
        disputes: s.disputes,
        reviews: s.reviews,
        tickets: s.tickets,
        notifications: s.notifications,
        audit: s.audit,
        kyc: s.kyc,
        gigs: s.gigs,
        offlineInstruments: s.offlineInstruments,
        trustCases: s.trustCases,
        priorityBoosts: s.priorityBoosts,
        messages: s.messages,
        scopeChanges: s.scopeChanges,
        consent: s.consent,
        theme: s.theme,
        guestDraft: s.guestDraft,
        buyerOnboardingComplete: s.buyerOnboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

// Selectors
export function currentUser(s: QQState): User | undefined {
  return s.users.find((u) => u.id === s.currentUserId);
}

export function unreadCount(s: QQState): number {
  return s.notifications.filter((n) => !n.read && n.userId === s.currentUserId).length;
}

export function myNotifications(s: QQState): NotificationItem[] {
  return s.notifications.filter((n) => n.userId === s.currentUserId);
}

export { buyerFee };
