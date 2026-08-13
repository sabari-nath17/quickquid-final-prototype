# Shared state sheet — forms and unsaved work

- Validate on blur for field-level guidance and again on submit.
- Keep the dominant submit action visible; disable it only when the reason is explained.
- Register dirty fields with `useNavigationGuard` before a Back, role switch, or route-changing CTA.
- Confirm text names the consequence: “Your brief edits will be discarded. Leave this page?”
- Explicit `Discard`, `Start over`, and modal `Cancel` keep their current semantics and must not silently mutate route history.
