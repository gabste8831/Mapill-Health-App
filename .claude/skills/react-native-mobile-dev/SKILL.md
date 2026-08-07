---
name: react-native-mobile-dev
description: Use this skill for general technical development work in React Native + Expo + TypeScript projects — component architecture, navigation, state management, performance, native permissions, offline storage, background tasks, testing, and build/release concerns. This is project-agnostic technical guidance (not tied to any specific app's business logic). Trigger for requests like "how should I structure navigation", "this FlatList is slow", "how do I request camera/notification permissions", "best way to manage global state", "how to debounce this input", "set up background fetch", or any RN/Expo implementation question. If the request also involves a specific app's domain rules (e.g. a project that has its own dev skill), use both together.
---

# React Native + Expo — Technical Dev Skill

General-purpose engineering guidance for React Native/Expo/TypeScript apps. This skill covers
*how* to build things well technically; it does not know about any specific app's business
rules — combine it with a project-specific skill when one exists.

## Core defaults

- **TypeScript strict mode always.** No `any`, no implicit `any`. Prefer discriminated unions
  over optional-everything types for state modeling (e.g. `{status:'loading'} | {status:'error', message:string} | {status:'success', data:T}`).
- **Expo managed workflow first.** Reach for Expo's own modules (`expo-notifications`,
  `expo-sqlite`, `expo-secure-store`, `expo-camera`, `expo-file-system`, etc.) before pulling in
  a bare React Native community package. Only suggest ejecting/config plugins when Expo has no
  equivalent.
- **Functional components + hooks.** No class components unless integrating legacy code.

## Navigation

- Use `@react-navigation/native` with typed navigators — define a `RootStackParamList` (or
  per-navigator param list) and type `useNavigation`/`useRoute` against it. Untyped navigation
  params are a common source of runtime crashes in RN; always type them.
- Keep navigation structure shallow when possible; deeply nested navigators complicate
  deep-linking and back-button behavior.

## State management

- Local UI state → `useState`/`useReducer`.
- Shared app state that doesn't need cross-render optimization → React Context, but split
  contexts by concern (don't put everything in one giant `AppContext` — causes unnecessary
  re-renders).
- Complex/frequent global state (e.g. sync queues, cached lists) → lightweight state library
  (Zustand is a solid default for RN — less boilerplate than Redux, works well with hooks).
- Server/remote data with caching, retries, and background refetch → TanStack Query works in
  RN too and pairs well with an offline-first repository layer.

## Performance

- `FlatList`/`FlashList` for any list of unknown/large length — never `.map()` inside a
  `ScrollView` for dynamic lists.
- Memoize list item components with `React.memo` and stable `keyExtractor` — avoid inline
  arrow functions as `renderItem` when the list is large.
- Avoid anonymous functions/objects created inline in render for props that trigger memo
  comparisons; hoist or `useCallback`/`useMemo` them.
- Use the Hermes engine (default in modern Expo) and check bundle size before adding a new
  heavy dependency — verify it's tree-shakeable or has a lighter alternative.

## Permissions & native APIs

- Always request permissions contextually (right before the feature that needs them), not all
  at app launch — better UX and required by both iOS/Android review guidelines.
- Handle all three permission states explicitly: granted, denied, and "denied and can't ask
  again" (need to deep-link to system settings in that case).
- Wrap permission-gated features so the rest of the UI degrades gracefully if denied, rather
  than crashing or showing a blank screen.

## Background work & notifications

- Local scheduled notifications: `expo-notifications`, using `scheduleNotificationAsync` with
  a trigger — this runs at the OS level, independent of the JS thread being alive.
- True background data work (fetch/sync while app is closed): `expo-background-fetch` +
  `expo-task-manager` — be aware of OS-level throttling (iOS in particular is aggressive about
  background execution time; design sync logic to be resumable/idempotent, not dependent on a
  long-running background window).

## Offline storage patterns

- `expo-sqlite` for structured relational local data with queries.
- `expo-secure-store` for small sensitive values (tokens, keys) — never put auth tokens in
  AsyncStorage.
- Design writes as local-first: write to SQLite synchronously (from the UI's perspective),
  queue remote sync separately — never block a user interaction on network round-trip.

## Testing

- Unit test business logic (use-cases/reducers/utils) with Jest — keep this logic
  UI-independent so it's testable without rendering.
- Component/interaction tests: React Native Testing Library — test behavior (what the user
  sees/does), not implementation details.
- E2E: Detox or Maestro for critical flows (auth, core CRUD) — not necessary for every screen.

## Build & release

- Use EAS Build for managed builds (handles native config without ejecting).
- Keep environment-specific config (API URLs, keys) in `.env` files loaded via
  `expo-constants`/`app.config.ts`, never hardcoded — and never commit secrets.
- Version bump and changelog discipline matters more once the app has real users — set this up
  even for early TCC/thesis-stage apps if you plan to distribute test builds.

## See also

- `references/common-pitfalls.md` — frequent RN/Expo mistakes and how to avoid them
