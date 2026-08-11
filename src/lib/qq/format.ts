// QuickQuid formatting & fee helpers

export const BETA_BUYER_FEE_RATE = 0; // 0% take rate (payment system to be integrated)
export const PLATFORM_COMMISSION_RATE = 0; // 0% from Pro

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRPlain(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buyerFee(proFee: number): number {
  return Math.round(proFee * BETA_BUYER_FEE_RATE);
}

export function buyerTotal(proFee: number): number {
  return proFee + buyerFee(proFee);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function hoursSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
}

export function budgetBand(amount: number): string {
  if (amount < 20000) return "Under ₹20,000";
  if (amount <= 55000) return "₹20,000 - ₹55,000";
  if (amount <= 100000) return "₹55,001 - ₹1,00,000";
  return "Above ₹1,00,000";
}

export function maskAccount(acct: string): string {
  if (acct.length <= 4) return "••••";
  return "••••••" + acct.slice(-4);
}

export function maskPan(pan: string): string {
  if (pan.length <= 4) return "••••";
  return pan.slice(0, 2) + "•••••" + pan.slice(-2);
}

export function maskIfsc(ifsc: string): string {
  if (ifsc.length <= 4) return "••••";
  return ifsc.slice(0, 4) + "••••";
}

export function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// Detect circumvention signals (phone, email, payment links)
export function detectCircumvention(text: string): string[] {
  const flags: string[] = [];
  const phoneRe = /(?:\+?91[\s-]?)?[6-9]\d{9}/;
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const linkRe = /(paytm|gpay|phonepe|razorpay|upi|:b\/|paypal\.me|stripe\.com)/i;
  if (phoneRe.test(text)) flags.push("phone number");
  if (emailRe.test(text)) flags.push("email address");
  if (linkRe.test(text)) flags.push("payment link");
  return flags;
}

export const BUDGET_BANDS = [
  "Under ₹20,000",
  "₹20,000 - ₹55,000",
  "₹55,001 - ₹1,00,000",
  "Above ₹1,00,000",
];

export const CATEGORIES = [
  "Web Development",
  "Product Design",
  "UX Research",
  "Content Writing",
  "Brand & Identity",
  "Frontend Engineering",
  "Backend Engineering",
  "Data & Analytics",
  "QA & Testing",
  "DevOps",
];

export const DECLINE_REASONS = [
  "Budget too high",
  "Skills mismatch",
  "Timeline mismatch",
  "Chose another Pro",
  "Brief changed",
  "Other",
];

export const PAYMENT_REJECTION_REASONS = [
  "Amount mismatch",
  "Reference not found",
  "Date mismatch",
  "Duplicate reference",
  "Evidence unclear",
  "Suspected risk",
];

export const GIG_MODERATION_REASONS = [
  "Unclear scope",
  "Unsupported claim",
  "Missing deliverable",
  "Contact/payment information",
  "Duplicate service",
  "Pricing inconsistency",
  "Evidence problem",
];

export const DISPUTE_CATEGORIES: { value: string; label: string }[] = [
  { value: "scope", label: "Scope" },
  { value: "quality_bugs", label: "Quality / Bugs" },
  { value: "timeline", label: "Timeline" },
  { value: "communication", label: "Communication" },
  { value: "payment", label: "Payment" },
  { value: "delivery_evidence", label: "Delivery evidence" },
  { value: "other", label: "Other" },
];
