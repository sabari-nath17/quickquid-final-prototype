import type { ExternalProfileLink, ExternalProfileProvider } from "./types";

const HOSTS: Record<ExternalProfileProvider, string[]> = {
  github: ["github.com", "www.github.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  behance: ["behance.net", "www.behance.net"],
  dribbble: ["dribbble.com", "www.dribbble.com"],
  website: [],
  other: [],
};

export const EXTERNAL_PROFILE_OPTIONS: { value: ExternalProfileProvider; label: string; hint: string }[] = [
  { value: "github", label: "GitHub", hint: "Public repositories and contribution proof" },
  { value: "linkedin", label: "LinkedIn", hint: "Professional history and identity context" },
  { value: "behance", label: "Behance", hint: "Visual case studies" },
  { value: "dribbble", label: "Dribbble", hint: "Design work samples" },
  { value: "website", label: "Portfolio website", hint: "A public portfolio or case-study site" },
  { value: "other", label: "Other proof", hint: "A public, relevant work link" },
];

export function externalProviderLabel(provider: ExternalProfileProvider): string {
  return EXTERNAL_PROFILE_OPTIONS.find((option) => option.value === provider)?.label ?? "External proof";
}

/**
 * Validate a public proof URL without ever accepting contact, payment, or deep-link schemes.
 * OAuth/API connections belong behind a server-side adapter in the production app.
 */
export function normalizeExternalProfileUrl(raw: string, provider: ExternalProfileProvider): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (/(wa\.me|whatsapp|telegram|t\.me|paytm|phonepe|gpay|upi|paypal|stripe)/i.test(`${host}${url.pathname}`)) return null;
    const allowed = HOSTS[provider];
    if (allowed.length > 0 && !allowed.includes(host)) return null;
    if (!url.pathname || url.pathname === "/") {
      if (provider !== "website" && provider !== "other") return null;
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function externalProfileHandle(link: ExternalProfileLink): string | null {
  if (link.provider !== "github") return null;
  try {
    const url = new URL(link.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

export function externalLinkIsAllowed(link: ExternalProfileLink): boolean {
  return normalizeExternalProfileUrl(link.url, link.provider) !== null;
}
