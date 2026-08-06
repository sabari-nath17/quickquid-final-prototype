// QuickQuid domain types

export type Role =
  | "visitor"
  | "buyer"
  | "pro"
  | "admin_support"
  | "finance"
  | "risk"
  | "ops_manager";

export type RoleLabel =
  | "Visitor"
  | "Buyer"
  | "Pro"
  | "Admin Support (Tier 1)"
  | "Finance (Tier 2)"
  | "Risk (Tier 3)"
  | "Ops Manager";

export type VerificationStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "pending_reverification";

export type Availability = "available_now" | "paused" | "booked";

export type BriefVisibility = "open" | "private";

export type BriefStatus =
  | "draft"
  | "active"
  | "approaching_inactivity"
  | "archived"
  | "republished";

export type ProposalStatus =
  | "pending"
  | "shortlisted"
  | "expired"
  | "withdrawn"
  | "reactivation_requested"
  | "declined";

export type ContractStatus =
  | "offer_draft"
  | "offer_sent"
  | "offer_accepted_pending_funding"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed";

export type MilestoneStatus =
  | "not_started"
  | "funding_pending"
  | "funded"
  | "work_active"
  | "submitted"
  | "in_review"
  | "accepted"
  | "payout_queued"
  | "payout_processed"
  | "rejected";

export type PaymentEvidenceStatus =
  | "payment_evidence_submitted"
  | "under_admin_verification"
  | "payment_confirmed"
  | "payment_rejected"
  | "more_info_requested"
  | "escalated";

export type PayoutStatus =
  | "queued"
  | "maker_confirmed"
  | "checker_authorized"
  | "processing"
  | "processed"
  | "failed";

export type RefundStatus =
  | "requested"
  | "approved"
  | "executed"
  | "rejected";

export type DisputeStatus =
  | "opened"
  | "under_mediation"
  | "evidence_requested"
  | "resolved"
  | "escalated_ops";

export type DisputeCategory =
  | "scope"
  | "quality_bugs"
  | "timeline"
  | "communication"
  | "payment"
  | "delivery_evidence"
  | "other";

export type TicketStatus =
  | "submitted"
  | "assigned"
  | "waiting_user"
  | "waiting_admin"
  | "resolved"
  | "reopened";

export type PaymentMethod = "NEFT" | "IMPS" | "RTGS" | "UPI" | "Bank Transfer";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  headline?: string;
  avatarColor?: string;
  location?: string;
  industry?: string;
  verification: string;
  verificationStatus: VerificationStatus;
}

export interface ProProfile {
  userId: string;
  displayName: string;
  headline: string;
  bio: string;
  primaryCategory: string;
  secondaryCategory?: string;
  skills: string[];
  portfolioItems: PortfolioItem[];
  availability: Availability;
  responseTime: string;
  preferredProjectSize: string;
  preferredTimeline: string;
  languages: string[];
  timeZone: string;
  publicVisibility: boolean;
  trustSignals: string[];
  completedProjects: number;
  rating: number;
  responseTimeHours: number;
  payoutReadiness: VerificationStatus;
  payoutDetails?: {
    beneficiaryName: string;
    accountNumberMasked: string;
    ifscMasked: string;
    bankName: string;
  };
  feeFrom?: number;
}

export interface BuyerProfile {
  userId: string;
  displayName: string;
  companyDescription: string;
  industry: string;
  website?: string;
  hiringCategories: string[];
  logoColor?: string;
  orgDetails?: {
    companyName: string;
    billingAddress: string;
    gstin?: string;
    billingContact: string;
  };
  publicVisibility: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  type: "case_study" | "link" | "image";
  url?: string;
  featured?: boolean;
}

export interface Brief {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  category: string;
  objective: string;
  deliverables: string[];
  acceptanceCriteria: string[];
  exclusions: string[];
  budget: number;
  timeline: string;
  visibility: BriefVisibility;
  status: BriefStatus;
  createdAt: string;
  attachments?: string[];
  applicants?: number;
}

export interface Proposal {
  id: string;
  briefId: string;
  briefTitle: string;
  proId: string;
  proName: string;
  proHeadline: string;
  proposedFee: number;
  coverLetter: string;
  deliveryApproach: string;
  availability: string;
  evidence: string[];
  status: ProposalStatus;
  createdAt: string;
  privateNote?: string;
  declineReason?: string;
}

export interface Milestone {
  id: string;
  index: number;
  label: string;
  description: string;
  proFee: number;
  status: MilestoneStatus;
  acceptanceCriteria: string[];
  submittedAt?: string;
  acceptedAt?: string;
  deliveryLink?: string;
  deliveryNote?: string;
  versions: DeliveryVersion[];
}

export interface DeliveryVersion {
  id: string;
  version: number;
  status: "current" | "in_review" | "rejected" | "accepted";
  submitter: string;
  timestamp: string;
  link: string;
  changeNote: string;
}

export interface Contract {
  id: string;
  buyerId: string;
  buyerName: string;
  proId: string;
  proName: string;
  briefId: string;
  briefTitle: string;
  scope: string;
  exclusions: string[];
  timeline: string;
  totalProFee: number;
  revisions: number;
  milestones: Milestone[];
  status: ContractStatus;
  createdAt: string;
  cancellationTerms: string;
  currentMilestoneId?: string;
}

export interface PaymentEvidence {
  id: string;
  contractId: string;
  milestoneId: string;
  milestoneLabel: string;
  amountDue: number;
  amountReceived?: number;
  utr: string;
  method: PaymentMethod;
  date: string;
  status: PaymentEvidenceStatus;
  targetReviewHours: number;
  screenshot?: string;
  rejectionReason?: string;
  makerId?: string;
  checkerId?: string;
  bankEvidence?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export interface Payout {
  id: string;
  contractId: string;
  proId: string;
  proName: string;
  milestoneLabel: string;
  proFee: number;
  commission: number;
  statutoryWithholding?: number;
  bankCharge?: number;
  netPayout: number;
  status: PayoutStatus;
  reference?: string;
  beneficiaryToken: string;
  queuedAt: string;
  processedAt?: string;
  failureReason?: string;
  slipAvailable: boolean;
}

export interface Refund {
  id: string;
  contractId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  approver?: string;
  beneficiaryToken: string;
  transferReference?: string;
  createdAt: string;
  executedAt?: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: "buyer" | "pro";
  raisedByName: string;
  category: DisputeCategory;
  affectedMilestone?: string;
  requestedResolution: string;
  narrative: string;
  evidence: string[];
  desiredOutcome: string;
  status: DisputeStatus;
  counterclaim?: string;
  adminDecision?: string;
  createdAt: string;
  slaOpenedAt: string;
  owner?: string;
}

export interface Review {
  id: string;
  contractId: string;
  fromUserId: string;
  fromName: string;
  toRole: "buyer" | "pro";
  rating: number;
  comment: string;
  visible: boolean;
  bothSubmitted: boolean;
  createdAt: string;
  images?: { id: string; color: string; label?: string }[];
  appeal?: {
    reason: string;
    evidence: string;
    status: "pending" | "upheld" | "removed" | "clarification" | "restored";
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  category:
    | "payment"
    | "contract"
    | "verification"
    | "payout"
    | "dispute"
    | "bug"
    | "other";
  subject: string;
  description: string;
  attachedContext?: {
    contractId?: string;
    paymentReference?: string;
    status?: string;
    latestEvent?: string;
  };
  status: TicketStatus;
  owner?: string;
  createdAt: string;
  messages: { from: "user" | "admin"; text: string; at: string }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | "proposal_received"
    | "payment_submitted"
    | "payment_confirmed"
    | "payment_rejected"
    | "payout_processed"
    | "dispute_update"
    | "kyc_result"
    | "contract_accepted"
    | "deliverable_submitted"
    | "payout_queued"
    | "dispute_opened"
    | "message"
    | "sla_warning";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  adminId: string;
  adminRole: Role;
  action: string;
  entity: string;
  entityId: string;
  oldStatus?: string;
  newStatus?: string;
  timestamp: string;
  reason?: string;
  maskedReveal?: boolean;
}

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  identityDocName: string;
  identityDocStatus: "uploaded" | "rejected";
  panMasked: string;
  accountNumberMasked: string;
  ifscMasked: string;
  beneficiaryName: string;
  status: VerificationStatus;
  submittedAt: string;
  resolvedAt?: string;
  rejectionReason?: string;
  riskFlag?: {
    signal: string;
    confidence: number;
    priorAccountStatus: string;
    hashedSignal: string;
  };
}

export interface GigDraft {
  id: string;
  proId: string;
  proName: string;
  title: string;
  category: string;
  subcategory?: string;
  tags: string[];
  shortDescription: string;
  detailedDescription: string;
  includedItems: string[];
  exclusions: string[];
  deliverableFormat: string;
  revisions: number;
  deliveryTimeline: string;
  buyerRequirements: string[];
  evidence: string[];
  coverImageColor: string;
  packageName: string;
  proFee: number;
  availability: boolean;
  maxConcurrentOrders: number;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved_live"
    | "changes_requested"
    | "rejected"
    | "paused"
    | "archived";
  createdAt: string;
  views: number;
  requests: number;
  rating?: number;
  moderationReason?: string;
}

export interface OfflineInstrument {
  id: string;
  contractRef: string;
  instrumentType: "Cheque" | "DD" | "Bankers Cheque";
  bank: string;
  instrumentNumber: string;
  amount: number;
  receivedDate: string;
  expectedSettlement: string;
  owner: string;
  status: "logged" | "pending_settlement" | "cleared" | "dishonoured" | "escalated";
}

export interface TrustSafetyCase {
  id: string;
  complainant: string;
  affectedEntity: string;
  allegation: string;
  evidence: string[];
  urgency: "low" | "medium" | "high" | "critical";
  owner?: string;
  status: "open" | "investigating" | "restricted" | "suspended_content" | "suspended_account" | "restored" | "escalated_counsel";
  actionHistory: { action: string; at: string; by: string }[];
  resolution?: string;
  createdAt: string;
}

export type ViewName =
  | "role_selection"
  | "auth"
  | "readiness"
  | "buyer_dashboard"
  | "buyer_profile"
  | "buyer_talent"
  | "buyer_brief_new"
  | "buyer_brief_detail"
  | "buyer_contract"
  | "buyer_payment"
  | "buyer_messages"
  | "pro_dashboard"
  | "pro_profile"
  | "pro_briefs"
  | "pro_proposals"
  | "pro_contract"
  | "pro_payouts"
  | "pro_gigs"
  | "pro_gig_new"
  | "pro_gig_detail"
  | "admin_operations"
  | "admin_kyc"
  | "admin_payments"
  | "admin_payouts"
  | "admin_refunds"
  | "admin_disputes"
  | "admin_trust"
  | "admin_audit"
  | "admin_gig_moderation"
  | "support"
  | "public_profile"
  | "brief_detail_public"
  | "notifications"
  | "admin_notes"
  | "media_lifecycle_demo";

export interface ViewParams {
  [key: string]: string | undefined;
}
