# Accessibility Checklist — React Native Screens

- [ ] Every interactive element has an `accessibilityLabel` describing its action in plain
      language (not just relying on visible text, since screen readers need explicit labels for
      icon-only buttons).
- [ ] Touch targets are at least 44x44pt (iOS) / 48x48dp (Android), with adequate spacing to
      avoid accidental taps — critical for users with reduced dexterity.
- [ ] Text supports dynamic font scaling (respect the OS's font-size accessibility setting);
      avoid fixed-height containers that clip text when scaled up.
- [ ] Color contrast meets at least WCAG AA (4.5:1 for normal text) — verify with a contrast
      checker, don't eyeball it.
- [ ] Status/state changes (dose confirmed, sync complete, error) are announced to screen
      readers via `accessibilityLiveRegion` or equivalent, not conveyed by visual change alone.
- [ ] Forms have clear, persistent labels (not placeholder-only labels that disappear on focus
      — a well-known usability antipattern that hurts users with memory/attention limitations).
- [ ] Critical flows (confirm dose, view schedule) are fully operable via screen reader
      (VoiceOver/TalkBack) — test manually with the screen reader on, not just assume compliance.
- [ ] Avoid time-limited interactions without a way to extend/disable the timer — a user who
      needs longer to read/respond shouldn't be penalized.
