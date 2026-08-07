# Common React Native / Expo Pitfalls

- **Keyboard covering inputs**: always wrap forms in `KeyboardAvoidingView` (with correct
  `behavior` per platform: `padding` on iOS, `height` on Android) or use a library like
  `react-native-keyboard-controller` for complex forms.
- **Stale closures in `useEffect`**: forgetting a dependency causes callbacks to reference
  outdated state — this is a very common source of "it worked once then stopped updating" bugs.
  Lint with `eslint-plugin-react-hooks` and don't silence the exhaustive-deps rule casually.
- **Platform differences assumed away**: shadows, fonts, and date pickers render very
  differently on iOS vs Android — always test both, don't assume a component "just works"
  cross-platform without checking.
- **SQLite transactions not batched**: doing many individual `execAsync` calls in a loop is
  much slower than wrapping them in a single transaction — batch writes when importing/seeding
  larger datasets.
- **Notification permissions on Android 13+**: `POST_NOTIFICATIONS` is a runtime permission
  since Android 13 — must be requested explicitly, unlike older Android versions where it was
  granted by default.
- **App size bloat from unused Expo modules**: importing `expo-*` packages you don't use still
  affects bundle size in some cases — audit `app.json`/`expo-doctor` output periodically.
- **Testing on emulator only**: background task throttling, notification delivery, and battery
  optimization behavior differ significantly between emulator and real devices — validate
  critical timing-sensitive features (like medication alarms) on physical hardware before
  considering them done.
