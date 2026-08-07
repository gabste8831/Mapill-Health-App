---
name: usability-heuristics-health-ui
description: Use this skill when designing or evaluating UI/UX for mobile apps, especially health/wellness apps — applying Nielsen's usability heuristics, accessibility for elderly or cognitively-loaded users, error prevention, and interaction design for critical/high-stakes flows (medication, medical data, appointments). Trigger for requests like "review this screen's usability", "how should this form be laid out", "is this flow accessible", "design a confirmation step for X", "make this easier for elderly users", or any UI/UX critique or design question — not just for health apps, but especially relevant there. Combine with a technical mobile-dev skill when actual implementation is also needed.
---

# Usability Heuristics & Health-App UI/UX

Design guidance grounded in Jakob Nielsen's usability heuristics (1994) and human-factors
principles for interfaces used by people under cognitive load, stress, or with age-related
limitations — the typical profile for health/medication-adherence apps.

## Nielsen's 10 heuristics — quick reference and health-app application

1. **Visibility of system status** — always show whether a dose was confirmed, is pending, or
   overdue; never leave the user guessing about the current state of their treatment.
2. **Match between system and the real world** — use plain language ("dose", "próxima consulta")
   over technical/clinical jargon; icons should match real-world objects (pill bottle, calendar)
   not abstract symbols.
3. **User control and freedom** — allow undo for accidental confirmations (e.g. "marked as
   taken" should be reversible within a short window); never trap users in a flow with no exit.
4. **Consistency and standards** — one visual language for "confirm", one for "cancel/skip",
   used identically across every screen — don't reinvent per-screen.
5. **Error prevention** — this is the priority heuristic for critical actions. Require explicit
   confirmation before irreversible or high-stakes actions (deleting a treatment, marking a
   dose as taken retroactively). Disable/hide actions that don't make sense in the current state
   rather than letting the user hit an error after the fact.
6. **Recognition rather than recall** — surface medication names, dosages, and schedules
   visually (icons, color-coding by treatment) instead of requiring the user to remember them;
   autocomplete/lookup (e.g. from a medication database) over free-text entry whenever possible.
7. **Flexibility and efficiency of use** — support both a simple guided flow for first-time/less
   tech-savvy users and shortcuts (quick-confirm from a notification) for repeat actions.
8. **Aesthetic and minimalist design** — every element on a medication screen should earn its
   place; avoid decorative clutter that competes with the one action that matters (confirm this
   dose).
9. **Help users recognize, diagnose, and recover from errors** — error messages should say what
   happened and what to do next in plain language, not a technical code ("Não foi possível
   salvar. Verifique sua conexão e tente novamente" — not "Error 500").
10. **Help and documentation** — keep it minimal but discoverable; a well-designed error
    prevention flow should reduce how often help is even needed.

## Designing for the target user (elderly / polymedicated patients)

- **High contrast, large touch targets** (minimum ~44x44pt), generous spacing between
  interactive elements to reduce mis-taps.
- **Avoid relying on color alone** to convey status (e.g. overdue vs. on-time) — pair color with
  icon/text, for colorblind accessibility and general clarity.
- **Reduce steps to the critical action.** The most frequent action (confirm a dose) should be
  reachable in one tap, ideally from a notification itself, not several screens deep.
- **Progressive disclosure**: show the essential info first (what to take, when), hide secondary
  detail (full prescription history, technical stock calculations) behind a clear "see more" —
  don't overwhelm the primary screen.
- **Confirmation patterns for critical/destructive actions**: a lightweight modal or inline
  expand with a clear "Sim, confirmar" / "Cancelar" — avoid double-negative phrasing ("Não
  cancelar?") which increases cognitive load and error risk.

## Gamification — used carefully

- Positive reinforcement (streaks, progress indicators) is appropriate as an *accessory*
  motivator, but must never gate or complicate the core action. If a user wants to just confirm
  a dose and leave, gamification UI should not add friction to that path.
- Avoid guilt-based negative reinforcement (e.g. shaming visuals for missed doses) — this can
  discourage continued engagement rather than support it, and runs counter to supporting user
  wellbeing.

## When reviewing an existing screen/flow

Structure feedback around: (1) which heuristic is being violated, (2) the concrete risk this
creates for this specific user population (confusion, error, abandonment), (3) a specific,
actionable fix — not just "this could be clearer."

## See also

- `references/accessibility-checklist.md` — concrete a11y checks for RN screens
