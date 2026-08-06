"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Sidebar, MobileSidebar, Header, MobileBottomNav } from "./shell/Shell";
import { NotificationDrawer } from "./shell/NotificationDrawer";
import { SupportWidget } from "./shell/SupportWidget";
import { CommandPalette, ThemeProvider } from "./shell/CommandPalette";
import { OnboardingTour } from "./shell/OnboardingTour";
import { RoleSelectionScreen, AuthScreen } from "@/components/qq/screens/visitor/RoleAuthScreens";
import { ReadinessScreen } from "@/components/qq/screens/visitor/ReadinessScreen";
import { BuyerDashboard, BuyerProfile, BuyerTalent, BuyerBriefNew, BuyerBriefDetail, BuyerContract, BuyerPayment, BuyerMessages } from "@/components/qq/screens/buyer/BuyerScreens";
import { ProDashboard, ProProfile, ProBriefs, ProProposals, ProContract, ProPayouts, ProGigs, ProGigNew, ProGigDetail } from "@/components/qq/screens/pro/ProScreens";
import { AdminOperations, AdminKyc, AdminPayments, AdminPayouts, AdminRefunds, AdminDisputes, AdminTrust, AdminAudit, AdminGigModeration, AdminNotes } from "@/components/qq/screens/admin/AdminScreens";
import { MediaLifecycleDemo } from "@/components/qq/screens/admin/MediaLifecycleDemo";
import { SupportScreen, PublicProfileScreen, BriefDetailPublic, NotificationsScreen } from "@/components/qq/screens/support/SupportScreens";
import type { ViewName } from "@/lib/qq/types";

const ROUTES: Partial<Record<ViewName, React.ComponentType>> = {
  role_selection: RoleSelectionScreen,
  auth: AuthScreen,
  readiness: ReadinessScreen,
  buyer_dashboard: BuyerDashboard,
  buyer_profile: BuyerProfile,
  buyer_talent: BuyerTalent,
  buyer_brief_new: BuyerBriefNew,
  buyer_brief_detail: BuyerBriefDetail,
  buyer_contract: BuyerContract,
  buyer_payment: BuyerPayment,
  buyer_messages: BuyerMessages,
  pro_dashboard: ProDashboard,
  pro_profile: ProProfile,
  pro_briefs: ProBriefs,
  pro_proposals: ProProposals,
  pro_contract: ProContract,
  pro_payouts: ProPayouts,
  pro_gigs: ProGigs,
  pro_gig_new: ProGigNew,
  pro_gig_detail: ProGigDetail,
  admin_operations: AdminOperations,
  admin_kyc: AdminKyc,
  admin_payments: AdminPayments,
  admin_payouts: AdminPayouts,
  admin_refunds: AdminRefunds,
  admin_disputes: AdminDisputes,
  admin_trust: AdminTrust,
  admin_audit: AdminAudit,
  admin_gig_moderation: AdminGigModeration,
  admin_notes: AdminNotes,
  media_lifecycle_demo: MediaLifecycleDemo,
  support: SupportScreen,
  public_profile: PublicProfileScreen,
  brief_detail_public: BriefDetailPublic,
  notifications: NotificationsScreen,
};

// Views that render full-screen (no app shell) — visitor pre-auth + public browse
const FULLSCREEN: ViewName[] = ["role_selection", "auth"];

function ViewRouter() {
  const { view } = useQQ();
  const Comp = ROUTES[view] ?? RoleSelectionScreen;
  return <Comp />;
}

function Breadcrumb() {
  const { view, viewParams, navigate, currentRole } = useQQ();
  const crumbs: { label: string; view?: ViewName; params?: Record<string, string> }[] = [];
  const roleHome: ViewName = currentRole === "buyer" ? "buyer_dashboard" : currentRole === "pro" ? "pro_dashboard" : "admin_operations";
  const roleLabel = currentRole === "buyer" ? "Buyer" : currentRole === "pro" ? "Pro" : "Admin";
  if (currentRole !== "visitor" && !FULLSCREEN.includes(view)) {
    crumbs.push({ label: roleLabel, view: roleHome });
  }
  const map: Partial<Record<ViewName, string>> = {
    buyer_dashboard: "Dashboard",
    buyer_profile: "Profile",
    buyer_talent: "Talent",
    buyer_brief_new: "New brief",
    buyer_brief_detail: viewParams.briefId ? `Brief ${viewParams.briefId}` : "Brief",
    buyer_contract: viewParams.contractId ? `Contract ${viewParams.contractId}` : "Contract",
    buyer_payment: viewParams.contractId ? `Payment ${viewParams.contractId}` : "Payment",
    buyer_messages: "Messages",
    pro_dashboard: "Dashboard",
    pro_profile: "Profile",
    pro_briefs: "Briefs",
    pro_proposals: "Proposals",
    pro_contract: viewParams.contractId ? `Contract ${viewParams.contractId}` : "Contract",
    pro_payouts: "Payouts",
    pro_gigs: "Gigs (v0.2)",
    pro_gig_new: "New gig (v0.2)",
    pro_gig_detail: viewParams.gigId ? `Gig ${viewParams.gigId}` : "Gig (v0.2)",
    admin_operations: "Operations",
    admin_kyc: "KYC queue",
    admin_payments: "Payments",
    admin_payouts: "Payouts",
    admin_refunds: "Refunds",
    admin_disputes: "Disputes",
    admin_trust: "Trust & Safety",
    admin_audit: "Audit log",
    admin_gig_moderation: "Gig moderation (v0.2)",
    admin_notes: "Admin notes",
    media_lifecycle_demo: "Media & lifecycle",
    support: "Support",
    public_profile: "Public profile",
    brief_detail_public: "Brief",
    notifications: "Notifications",
    readiness: "Readiness",
  };
  const label = map[view];
  if (label) crumbs.push({ label });
  if (crumbs.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-muted-foreground/50">/</span>}
          {c.view && i < crumbs.length - 1 ? (
            <button className="hover:text-foreground hover:underline" onClick={() => navigate(c.view!, c.params)}>{c.label}</button>
          ) : (
            <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : ""}>{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function QuickQuidApp() {
  const { view, currentRole, hydrated, navigate, payments, normalizeSlaTimestamps } = useQQ();
  const [mounted, setMounted] = React.useState(false);
  const [autoNormalized, setAutoNormalized] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // On hydration, restore the signed-in user to their role home instead of role_selection
  React.useEffect(() => {
    if (mounted && hydrated && currentRole !== "visitor" && view === "role_selection") {
      const home = currentRole === "buyer" ? "buyer_dashboard" : currentRole === "pro" ? "pro_dashboard" : "admin_operations";
      navigate(home);
    }
  }, [mounted, hydrated, currentRole, view, navigate]);

  // Auto-normalize SLA timestamps once on first hydration if seed data is stale (>60 days old).
  // This prevents every queue item from showing "Breached" because seed dates are from Jan 2025.
  React.useEffect(() => {
    if (mounted && hydrated && !autoNormalized && payments.length > 0) {
      const oldest = payments[0]?.submittedAt;
      if (oldest) {
        const ageDays = (Date.now() - new Date(oldest).getTime()) / 86400000;
        if (ageDays > 60) {
          normalizeSlaTimestamps();
        }
      }
      setAutoNormalized(true);
    }
  }, [mounted, hydrated, autoNormalized, payments, normalizeSlaTimestamps]);

  // Avoid hydration flash — render a neutral shell until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background font-bold">Q</div>
          <span className="font-medium">QuickQuid</span>
        </div>
      </div>
    );
  }

  const fullscreen = FULLSCREEN.includes(view) || currentRole === "visitor";

  if (fullscreen) {
    return (
      <ThemeProvider>
        <>
          <ViewRouter />
          <SupportWidget />
          <CommandPalette />
        </>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex flex-1">
          <Sidebar />
          <MobileSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
              <div className="mx-auto w-full max-w-[1200px] space-y-6">
                <Breadcrumb />
                <ViewRouter />
              </div>
            </main>
          </div>
        </div>
        <footer className="mt-auto border-t border-border bg-card px-4 py-4 pb-20 md:pb-4 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>QuickQuid v0.1 prototype · 0% Pro commission · 14% beta Buyer fee · Manual payment verification</span>
            <span className="hidden sm:inline">No wallet · No automated escrow · Payouts manually processed</span>
          </div>
        </footer>
        <MobileBottomNav />
        <NotificationDrawer />
        <SupportWidget />
        <CommandPalette />
        <OnboardingTour />
      </div>
    </ThemeProvider>
  );
}
