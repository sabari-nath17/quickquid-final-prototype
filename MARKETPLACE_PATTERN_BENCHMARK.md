# Buyer and Pro marketplace pattern benchmark

This is a visual-product reference for engineers and AI assistants extending the QuickQuid prototype. It records patterns observed from live Fiverr, Upwork, and Contra screens on 11 August 2026, and the deliberate QuickQuid adaptations. It is not permission to copy a competitor's copy, assets, trust claims, pricing, or interaction flows.

## Source captures

| Audience | Marketplace | Reference screen | Captured evidence |
| --- | --- | --- | --- |
| Buyer | Fiverr | Graphics & Design category entry | Live page capture in the design-QA browser session |
| Buyer | Upwork | Talent search and filter list | Live page capture in the design-QA browser session |
| Buyer | Contra | Hire landing and primary action hierarchy | Live page capture in the design-QA browser session |
| Pro | Upwork | Find work category/search flow | Live page capture in the design-QA browser session |
| Pro | Contra | Independent-facing prompt and community discovery | Live page capture in the design-QA browser session |
| Pro | Fiverr | Seller/dashboard visual reference found through image search after Fiverr's human check blocked the direct page | Google Images fallback capture in the design-QA browser session |

Live reference URLs: [Fiverr category](https://www.fiverr.com/categories/graphics-design), [Upwork talent](https://www.upwork.com/nx/search/talent/), [Contra hire](https://contra.com/hire), [Upwork work discovery](https://www.upwork.com/freelance-jobs/), and [Contra independent community](https://contra.com/independents).

Third-party captures are used for internal visual comparison only and are deliberately not committed to this repository. Engineers should open the live URLs above when a current visual reference is required.

## Patterns adapted into QuickQuid

| Source pattern | QuickQuid implementation | Why it fits QuickQuid |
| --- | --- | --- |
| Fiverr's quick category entry | Search-first Buyer discovery with visible category shortcuts | Lets a Buyer start from an outcome/capability without inventing a live-job feed. |
| Upwork's search, filters, result count, and sort control | Buyer talent search supports skill/category/name search, evidence and availability filters, result count, and explicit sorting | Buyers compare reviewable proof and capacity, not a black-box ranking. |
| Contra's sparse editorial action hierarchy | Primary input/action areas use one clear task and restrained secondary controls | Keeps the interface calm while preserving a clear action at every decision point. |
| Upwork's Pro work discovery | Pro brief search, filters, category-alignment sort, and visible commercial context | A Pro can decide quickly from scope, budget, timeline, exclusions, and visible fit signals. |
| Fiverr/Contra's creator profile emphasis | Pro profile starts with Buyer-facing profile health, proof/source count, work samples, and a one-click Buyer preview | The Pro sees what a Buyer can evaluate before editing long-form profile details. |

## Intentional differences and product guard rails

- QuickQuid uses **proof, readiness, Pact, delivery, and acceptance** as its differentiation. Do not convert the product into a generic search marketplace.
- “Recommended” and “Category-aligned” are transparent local ordering aids based on declared categories and skills. They are not matching guarantees, rankings, or verification decisions.
- QuickQuid Verified remains an Admin decision. Public proof links, provider cards, a profile picture, and API metadata must never imply identity, ownership, employment, skill, or quality verification.
- Do not copy competitor brand assets, testimonials, counter claims, fees, performance claims, creator data, or copyrighted images. Continue using the approved QuickQuid design system and real approved assets only.
- Buyer discovery must lead to a private brief/invite or a reviewed live gig. Pro discovery must keep paid work, onboarding, payout readiness, and proposal limits gated by the existing policy.
- Each discovery surface keeps one primary decision per context: `Review proof`, `Invite to brief`, `View`, or `Apply`. Do not turn every card into a pile of competing actions.

## Build checklist

- Keep search/filter controls keyboard accessible and at least 44px high for primary mobile interactions.
- Always reveal why a filter, recommendation, promotion, or disabled paid-work action is present.
- Preserve unsaved-change guards and app-level Back behavior when discovery opens a detail page.
- Test Buyer talent, public Pro profile, Pro briefs, Pro profile preview, and desktop/mobile overflow after any future discovery change.
