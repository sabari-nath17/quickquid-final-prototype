# Shared state sheet — data and permission states

| State | Surface treatment | Required copy/action |
|---|---|---|
| Loading | Skeleton rows preserve final geometry; no layout jump | “Loading…” plus the current section name |
| Empty | Dashed common-region card with one explanatory sentence | One primary recovery action; never a dead end |
| Error | Red only for recovery; keep the last known context visible | Human-readable cause, “Try again”, and Support link |
| Permission | Neutral lock/Shield icon and scope explanation | “Request access” or “Back to dashboard”; never expose restricted data |

Use `LoadingState`, `EmptyState`, `ErrorState`, and `AlertBanner` from `src/components/qq/shared` rather than page-specific variants.
