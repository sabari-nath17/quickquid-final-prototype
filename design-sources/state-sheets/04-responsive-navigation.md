# Shared state sheet — responsive navigation and actions

- Desktop uses the persistent role sidebar and a compact top search/header.
- Mobile collapses navigation into a labelled menu, keeps Back and the dominant action in the thumb zone, and uses 44px targets.
- Records use an 8/4 split on desktop and stacked decision rail on mobile; editors use 7/5 and move previews below the form.
- Never introduce horizontal scrolling for tables or action rails. Convert grouped rows to compact cards when the viewport is below 768px.
- Respect `prefers-reduced-motion`; transitions are supplementary feedback, never the only status signal.
