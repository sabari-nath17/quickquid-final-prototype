# QuickQuid screen source pack

This folder is the durable visual handoff for the 38 registered QuickQuid routes. The four supplied raster references are preserved in `references/` and optimized WebP copies are in `webp/`. They are anchors, not production UI: the live prototype remains the source of workflow truth.

## Visual contract

- Canvas: paper `#FCFBF7`, ink `#14151D`, 8px spacing rhythm.
- Headings: Sora. Interface copy: Source Sans 3. Metadata: IBM Plex Mono.
- Buyer action: cobalt. Pro opportunity: coral. Proof/completion: mint. Money: gold. Admin operations: indigo. Red is reserved for genuine risk/recovery.
- One dominant action per screen, no more than two supporting actions above the first content boundary, and all mobile targets are at least 44px.
- Provider links and profile enrichments remain explicitly marked as demo/synthetic until a consented backend adapter exists.

## Reference status

The approved anchors are `buyer_dashboard`, `pro_briefs`, and `admin_operations`. The earlier landing reference is retained in the repository's existing landing QA pack. `buyer-dashboard-direction.png` is a duplicate direction board, not a fourth route. All other registered routes use the same system and are tracked as new canonical frames in `manifest.json`.

The manifest is intentionally implementation-facing: each route records its role, canonical state, source anchor, mobile requirement, dominant action, and the expected screenshot path for QA. Capture implementation screenshots into `implementation/` as each batch is reviewed.

## Captured route images

The current implementation capture pass contains one desktop PNG and optimized WebP for every registered route under `implementation/` and `implementation-webp/`. The full review contact sheet is `implementation-contact-sheet.webp`. Mobile captures are included for the critical routes that were exercised at the 390 × 844 viewport; additional mobile captures can be added using the same filenames with a `-mobile` suffix.

## Shared state sheets

The state sheets are the cross-route contract for loading/empty/error/permission, form validation and unsaved work, modal/drawer behavior, and responsive navigation. They are deliberately shared so screens do not invent one-off interaction patterns.
