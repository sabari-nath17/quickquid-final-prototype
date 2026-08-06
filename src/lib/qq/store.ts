"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  User, Role, ProProfile, BuyerProfile, Brief, Proposal, Contract,
  PaymentEvidence, Payout, Refund, Dispute, Review, SupportTicket,
  NotificationItem, AuditEvent, KycSubmission, GigDraft, OfflineInstrument,
  TrustSafetyCase, ViewName, ViewParams, VerificationStatus, MilestoneStatus,
  PaymentEvidenceStatus, PayoutStatus, ContractStatus, DisputeStatus,
} from "./types";
import {
  SEED_USERS, SEED_PRO_PROFILES, SEED_BUYER_PROFILES, SEED_BRIEFS,
  SEED_PROPOSALS, SEED_CONTRACTS, SEED_PAYMENTS, SEED_PAYOUTS, SEED_REFUNDS,
  SEED_DISPUTES, SEED_REVIEWS, SEED_TICKETS, SEED_NOTIFICATIONS, SEED_AUDIT,
  SEED_KYC, SEED_GIGS, SEED_OFFLINE_INSTRUMENTS, SEED_TRUST_CASES, ADMIN_NOTES,
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

interface QQState {
  hydrated: boolean;
  // session
  currentRole: Role;
  currentUserId: string | null;
  view: ViewName;
  viewParams: ViewParams;
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
  navigate: (view: ViewName, params?: ViewParams) => void;
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
  upsertGig: (g: GigDraft) => void;
  updateGig: (id: string, patch: Partial<GigDraft>) => void;
  updateOfflineInstrument: (id: string, patch: Partial<OfflineInstrument>) => void;
  updateTrustCase: (id: string, patch: Partial<TrustSafetyCase>) => void;
  addMessage: (m: Message) => void;
  addScopeChange: (s: ScopeChange) => void;
  updateScopeChange: (id: string, patch: Partial<ScopeChange>) => void;
  updateProProfile: (userId: string, patch: Partial<ProProfile>) => void;
  updateBuyerProfile: (userId: string, patch: Partial<BuyerProfile>) => void;
  resetData: () => void;
}

const initialState = {
  currentRole: "visitor" as Role,
  currentUserId: null as string | null,
  view: "role_selection" as ViewName,
  viewParams: {} as ViewParams,
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
  messages: [
    { id: "MSG-1", contractId: "QQ-0892", from: "system", fromName: "QuickQuid", text: "Contract QQ-0892 accepted. Funding pending for M1. Pro should not begin work until payment is confirmed.", at: "2025-01-14T09:05:00Z" },
    { id: "MSG-2", contractId: "QQ-0892", from: "buyer", fromName: "Northstar Labs", text: "Hi Akhil, just submitted the M1 payment via NEFT. UTR is UTR982341771. Looking forward to kickoff once confirmed.", at: "2025-01-14T11:36:00Z" },
  ] as Message[],
  scopeChanges: [] as ScopeChange[],
  adminNotes: ADMIN_NOTES,
  consent: { terms: false, privacy: false, workRelationship: false, version: "v0.1", ts: "" },
  notificationDrawerOpen: false,
  supportWidgetOpen: false,
  mobileSidebarOpen: false,
  kycModalOpen: false,
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
        });
      },
      navigate: (view, params) => {
        set({ view, viewParams: params ?? {}, mobileSidebarOpen: false });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
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
      updateKyc: (id, patch) => set((s) => ({ kyc: s.kyc.map((k) => (k.id === id ? { ...k, ...patch } : k)) })),
      upsertGig: (g) => set((s) => {
        const idx = s.gigs.findIndex((x) => x.id === g.id);
        return { gigs: idx >= 0 ? s.gigs.map((x) => (x.id === g.id ? g : x)) : [g, ...s.gigs] };
      }),
      updateGig: (id, patch) => set((s) => ({ gigs: s.gigs.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      updateOfflineInstrument: (id, patch) => set((s) => ({ offlineInstruments: s.offlineInstruments.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      updateTrustCase: (id, patch) => set((s) => ({ trustCases: s.trustCases.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      addScopeChange: (sc) => set((s) => ({ scopeChanges: [...s.scopeChanges, sc] })),
      updateScopeChange: (id, patch) => set((s) => ({ scopeChanges: s.scopeChanges.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      updateProProfile: (userId, patch) => set((s) => ({ proProfiles: s.proProfiles.map((p) => (p.userId === userId ? { ...p, ...patch } : p)) })),
      updateBuyerProfile: (userId, patch) => set((s) => ({ buyerProfiles: s.buyerProfiles.map((b) => (b.userId === userId ? { ...b, ...patch } : b)) })),
      resetData: () => set({ ...initialState, hydrated: true }),
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
        messages: s.messages,
        scopeChanges: s.scopeChanges,
        consent: s.consent,
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
