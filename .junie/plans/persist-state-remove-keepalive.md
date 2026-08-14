---
sessionId: session-260813-110752-bvzq
---

# Requirements

### Overview & Goals
- Migrate the app away from `<KeepAlive>`-based state retention (currently in `src/App.vue`) toward persisted Pinia stores backed by `pinia-plugin-persistedstate` (already a dependency and already registered in `src/main.js`).
- Preserve the exact current UX for anything that today implicitly depends on `<KeepAlive>` — specifically `KTCarousel.vue`'s "resume last viewed slide" behavior driven by `onActivated`.
- Introduce a concrete, reusable strategy for expiring stale data from `localStorage`, sized around a ~6 hour "battle session" lifetime, since the app will soon add a battle-session tracking tool.
- Make carousel-position persistence resilient to future changes in the underlying item list — specifically, the eventual Crit/Tac Ops search/filter feature that will shrink/reorder `CritTacOps.vue`'s carousel items.
- Produce a `.md` design document capturing this plan for future reference.

### Scope
**In Scope**
- Remove the `<KeepAlive>` wrapper in `src/App.vue`.
- Convert `KTCarousel.vue`'s `onActivated` hook to `onMounted`, backed by a new `carousels` Pinia store, so slide position survives full component remounts.
- Harden that `carousels` store so a persisted position never breaks once the future CritTacOps search/filter feature can shrink or reorder the visible card list — a stale/out-of-range position must fall back gracefully instead of crashing or scrolling to the wrong card.
- Create a new, dedicated `battleSession` Pinia store holding only `BattleBoard.vue`'s `commandPoints`/`factionPoints`, replacing its local `ref`s.
- Reclassify (without merging) the existing `filterOperations` store: per the user's clarification it's earmarked as the future home of CritTacOps search/filter selection data (a checklist of chosen op IDs, consumed later by `CritTacOps.vue`), so it is explicitly excluded from the 6h battle TTL and kept on plain, non-expiring persistence — the same bucket as `carousels`.
- Build a shared, reusable "expiring persistence" utility (rolling 6h TTL) and apply it only to the new `battleSession` store.
- Add a one-time boot-time sweep (in `src/main.js`) that proactively removes expired `localStorage` entries before Pinia stores hydrate.
- Produce `.requirements/state-persistence-migration.md` documenting the approach.

**Out of Scope**
- Building new UI for `BattleBoard.vue` (the score buttons stay commented out in the template; only the underlying state model changes).
- Building the actual CritTacOps search/filter UI or wiring the `filterOperations` store into `CritCard.vue` / `TacCard.vue` / `OpCard.vue` (no consumer exists today; only the store's persistence classification is clarified/updated by this migration, in anticipation of that future feature).
- Persisting purely transient, DOM-derived view state (e.g. `App.vue`'s `isAtBottom` scroll-fade flag) — this is view-layer plumbing, not domain/component state, and intentionally stays local.
- Adding an automated test suite (none exists in the project today — no test runner in `package.json`).

### User Stories
- As a player, I want the app to remember which carousel slide I was viewing (Rules or Crit/Tac Ops) even after fully navigating away and back, so the UI feels stable.
- As a player, I want my in-progress battle score (once the battle-session tool is wired up) to survive closing and reopening the app during a single ~6 hour match, so I don't lose my score mid-game.
- As a player, I don't want abandoned/old battle scores to linger indefinitely in my browser's storage once a match is clearly over.
- As a player, I want my future Crit/Tac Ops search/filter selections to stay applied across visits, not just for the duration of one battle, so I don't have to re-pick them every session.

### Functional Requirements
- After removing `<KeepAlive>`, navigating between `/`, `/ops`, `/battle` fully mounts/unmounts the corresponding view component (no caching), with zero regression in visible behavior.
- `KTCarousel` restores the previously selected slide on (re)mount, matching current `onActivated` behavior, independently for the Rules carousel and the Crit/Tac Ops carousel.
- If a carousel's item list changes shape between visits (e.g. a future filter removes the previously-viewed card, or the list is temporarily empty), restoring a stale position never throws or scrolls out of range — it falls back to the first available slide.
- Session-scoped persisted data (battle scores) survives page reloads within 6 hours of the last interaction, and is discarded once 6 hours have elapsed since the last interaction (rolling TTL).
- The carousel-position store and the `filterOperations` (future CritTacOps filter-selection) store both persist indefinitely (UI/browsing preferences, not match data) and are unaffected by the 6h cleanup.

# Technical Design

### Current Implementation
- `src/App.vue` wraps every routed view in `<KeepAlive :max="10"><component :is="Component" ref="routedComponent" /></KeepAlive>` inside the `router-view` slot — this is the only `KeepAlive` usage in the app.
- `src/components/KTCarousel.vue` relies on that caching: it keeps a local `lastIndex` ref updated in `handleSelect`, and uses `onActivated` to snap the carousel back to `lastIndex` whenever the (cached) parent view is re-shown. Without `KeepAlive`, `onActivated` never fires again after the very first mount.
- `KTCarousel` is reused, unparameterized, by `src/views/Rules.vue` and `src/views/CritTacOps.vue` (each passes different `carouselItems`), so any store-backed replacement needs a per-instance identity.
- The existing `onActivated` safety net already special-cases a collapsed snap list (`if (embla.scrollSnapList().length <= lastIndex.value) embla.reInit()`) before calling `embla.scrollTo(lastIndex.value, true)`, but it still assumes `lastIndex` is a meaningful position in whatever list is currently rendered. Once `CritTacOps.vue`'s carousel items become filterable (via the future `filterOperations`-backed search/filter feature), a raw numeric index persisted across visits can silently point at the wrong card, or fall beyond the filtered list's new length.
- `src/stores/operations.js` already demonstrates the target persistence pattern (`persist: true`, via the already-registered `pinia-plugin-persistedstate` from `src/main.js`). Per the user's clarification, its real purpose is to back a **future search/filter feature on `CritTacOps.vue`**: `filterOperations` is a checklist of selected Crit/Tac Op IDs, and `addOperation`/`removeOperation`/`isOperationPresent` toggle whether an op is included in that filter selection. It currently has **no UI consumer**, but it is browsing/preference state, not battle-match state.
- `src/stores/carousels.js` exists but is empty — an evident placeholder for exactly the carousel-position state this migration needs.
- `src/views/BattleBoard.vue` is a work-in-progress screen: `commandPoints`/`factionPoints` are local `ref`s updated by (currently commented-out) `+`/`-` buttons; this is local component state that should move to a store per the migration goal, and is also the natural home for the upcoming "battle session" concept the user described.
- No other component (`AppHeader.vue`, `AppMenu.vue`, `RuleCard.vue`, `OpCard.vue`, `CritCard.vue`, `TacCard.vue`) holds meaningful local state; `App.vue`'s `isAtBottom`/`heroSection` scroll-fade logic is transient DOM-derived UI state, not migrated.

### Key Decisions
1. **TTL semantics — rolling from last activity.** The persisted `savedAt` timestamp is refreshed on every store mutation (this falls out naturally from `pinia-plugin-persistedstate`'s subscribe-and-serialize-on-every-change behavior). Data expires 6h after the *last* interaction, not 6h after the match started — so an actively-played match never gets wiped mid-game, while an abandoned session is cleaned up 6h after it went quiet.
2. **Cleanup mechanism — shared expiring serializer + one-time boot sweep.** Each session-scoped store configures a shared custom `serializer` (via `persist.serializer`) that embeds `{ savedAt, value }` and ignores/ discards stale reads. Additionally, `src/main.js` runs a small `pruneExpiredStores()` sweep once at startup (before `app.mount`) that removes any already-expired `localStorage` entries outright, so stale data never even gets hydrated into memory. No live timer/`visibilitychange` watcher is introduced; a continuously-open idle tab beyond 6h is an accepted limitation (see Risks).
3. **Store granularity — keep `filterOperations.js` separate from battle scores.** The user clarified that `filterOperations.js` is earmarked for a future CritTacOps search/filter feature (a checklist of selected op IDs), not for in-match "active ops" tracking. Because it's browsing/preference state rather than match data, merging it with battle scores under one 6h rolling TTL would be wrong — filter selections shouldn't vanish after 6h of inactivity, and unrelated filter edits shouldn't keep resetting a match-score expiry clock. So a new `src/stores/battleSession.js` is added holding only `commandPoints`/`factionPoints` under the expiring serializer, while `filterOperations.js` keeps its existing shape/id and switches to plain, non-expiring `persist: true` — the same bucket as `carousels.js`.
4. **Carousel position robustness against future filtering — persist by item id, not raw index.** Because `CritTacOps.vue`'s carousel items will later be filtered by the `filterOperations` selection, a plain numeric slide index isn't stable: filtering changes both the list's length and any given card's position within it. So `carousels.js` persists the *last-viewed item's `id`* (already a stable string on every `carouselItems` entry) per `carouselId`, and `KTCarousel.vue` resolves that id back to an index against whatever `carouselItems` it is currently rendering at mount time. If the id is no longer present (filtered out) or the list is empty, it falls back to slide 0 instead of throwing or scrolling out of range — the existing collapsed-snap-list `reInit` safety net stays as a second layer of defense.

### Proposed Changes
- **`src/stores/plugins/persistExpiry.js` (new)** — shared utility: `SIX_HOURS_MS`, `createExpiringSerializer(ttlMs)` for use as a store's `persist.serializer`, and `pruneExpiredStores()` for the boot-time sweep, driven by a small internal registry of session-scoped store keys/TTLs.
- **`src/main.js`** — call `pruneExpiredStores()` before `app.mount('#app')`.
- **`src/stores/carousels.js`** — implement `useCarouselStore` holding a `positions` map (`{ [carouselId]: itemId }`, storing the last-viewed item's stable string `id` rather than a raw numeric index) with plain `persist: true` (no TTL — it's a durable UI preference, not match data).
- **`src/components/KTCarousel.vue`** — add a required `carouselId` prop; drop `onActivated`; on `onMounted`, read the saved item id from `useCarouselStore().getPosition(carouselId)`, resolve it to an index via `carouselItems.findIndex(i => i.id === savedId)` (defaulting to `0` when not found or when `carouselItems` is empty), and apply it the same way the old safety-net logic did; `handleSelect` now also calls `setPosition(carouselId, carouselItems[index]?.id)`.
- **`src/views/Rules.vue`** / **`src/views/CritTacOps.vue`** — pass a unique `carousel-id` (e.g. `"rules"`, `"crit-tac-ops"`) to `<KTCarousel>`; remove the now-inaccurate "already cached by App.vue's KeepAlive" comment in `CritTacOps.vue`.
- **`src/App.vue`** — remove the `<KeepAlive>` wrapper; keep `<component :is="Component" ref="routedComponent" />` directly inside the `router-view` slot.
- **`src/stores/battleSession.js` (new)** — `useBattleSessionStore`: `commandPoints`/`factionPoints` and a `$reset()`; persisted with `persist: { serializer: createExpiringSerializer(SIX_HOURS_MS) }`.
- **`src/views/BattleBoard.vue`** — replace local `commandPoints`/`factionPoints` refs with `useBattleSessionStore()`, keeping the existing `onMounted` logging behavior intact.
- **`src/stores/operations.js`** — unchanged in shape/logic; simply excluded from the TTL registry so it keeps plain `persist: true` (durable filter-selection state for the future CritTacOps search/filter feature).

### Data Models / Contracts
```js
// src/stores/plugins/persistExpiry.js
export const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export function createExpiringSerializer(ttlMs) {
  return {
    serialize: (value) => JSON.stringify({ savedAt: Date.now(), value }),
    deserialize: (raw) => {
      if (!raw) return {}
      const { savedAt, value } = JSON.parse(raw)
      if (!savedAt || Date.now() - savedAt > ttlMs) return {}
      return value ?? {}
    },
  }
}

export function pruneExpiredStores() { /* iterates a small { key, ttlMs } registry, removes stale localStorage entries */ }
```
```js
// src/stores/carousels.js
useCarouselStore(): { positions, getPosition(carouselId), setPosition(carouselId, itemId), $reset() }
// positions: { [carouselId]: itemId } — last-viewed item's stable id, not a raw index,
// so a saved position stays meaningful even if the list is later filtered/reordered
// persist: true (no TTL)
```

```js
// src/stores/battleSession.js
useBattleSessionStore()
:
{
    commandPoints, factionPoints, $reset()
}
// persist: { serializer: createExpiringSerializer(SIX_HOURS_MS) }
```

```js
// src/stores/filterOperations.js (unchanged shape/logic — future CritTacOps filter-selection store)
useFilterOperationStore()
:
{
    filterOperations, getAllOperations, isOperationPresent,
        addOperation(opId), removeOperation(opId),
        $reset()
}
// persist: true (no TTL — same bucket as carousels.js)
```

### Components
- `App.vue` — loses `<KeepAlive>`; router-view content now fully remounts on navigation.
- `KTCarousel.vue` — gains `carouselId` prop; `onActivated` → `onMounted`-based restore via `useCarouselStore`, resolving a persisted item id back to an index with a safe fallback to slide 0 when it's missing or the list is empty.
- `Rules.vue`, `CritTacOps.vue` — pass `carousel-id`; `CritTacOps.vue` loses its stale KeepAlive comment.
- `BattleBoard.vue` — local score refs replaced by `useBattleSessionStore()` (scores only).

### File Structure
```
src/
  main.js                         (modified: boot sweep)
  App.vue                         (modified: remove KeepAlive)
  components/
    KTCarousel.vue                (modified: carouselId prop, onMounted restore)
  views/
    Rules.vue                     (modified: pass carousel-id)
    CritTacOps.vue                (modified: pass carousel-id, drop stale comment)
    BattleBoard.vue               (modified: use battleSession store)
  stores/
    carousels.js                  (implemented: position store, persist:true)
    battleSession.js              (new: scores only, expiring persist)
    filterOperations.js                 (unchanged: excluded from TTL sweep, kept as future CritTacOps filter-selection store)
    plugins/
      persistExpiry.js            (new: TTL serializer + boot sweep)
.requirements/
  state-persistence-migration.md  (new: this design, for reference)
```

### Architecture Diagram
```mermaid
graph TD
    Boot[main.js boot] -->|pruneExpiredStores| LS[(localStorage)]
    Boot --> Pinia[createPinia + persistedstate plugin]

    subgraph Views
        Rules[Rules.vue]
        CritTacOps[CritTacOps.vue]
        BattleBoard[BattleBoard.vue]
    end

    Rules -->|carousel-id="rules"| Carousel[KTCarousel.vue]
    CritTacOps -->|carousel-id="crit-tac-ops"| Carousel
    Carousel -->|onMounted restore / handleSelect| CarouselStore[carousels store: positions by item id]
    CarouselStore -->|persist: true, no TTL| LS

    CritTacOps -.->|future search/filter UI| OpsStore[operations store]
    OpsStore -->|persist: true, no TTL| LS

    BattleBoard --> BattleStore[battleSession store: scores only]
    BattleStore -->|persist: expiring serializer, rolling 6h TTL| LS

    App[App.vue: no KeepAlive] --> Rules
    App --> CritTacOps
    App --> BattleBoard
```

### Risks
- **Registry/key drift**: the boot-sweep registry in `persistExpiry.js` must stay in sync with each session-scoped store's actual persisted key (`store.$id` by default) — mitigated by keeping the registry colocated in the same file that defines the serializer helper, and by using the store's own `$id` string as the single source of truth.
- **`filterOperations.js` shape drift**: it still has no UI consumer today; when the CritTacOps search/filter feature is actually built, its shape (currently a flat op-id checklist) may need to evolve (e.g. free-text search, category toggles) — that evolution is future work, out of scope for this migration.
- **Carousel position invalidated by future filtering**: once CritTacOps gains a filter UI backed by the `filterOperations` store, its carousel's item list can shrink or reorder between visits; storing the *item id* instead of a raw index (Key Decision 4) means a stale or filtered-out position simply falls back to slide 0 on restore, rather than crashing or scrolling out of range.
- **Multi-tab usage**: the rolling TTL refreshes on every mutation from whichever tab is active; this is acceptable for a single-user companion app and not a scenario this app currently guards against.
- **Long continuous idle session**: if the app is left open (foregrounded, not reloaded) for more than 6h without any interaction, expiry is only re-evaluated on the next reload/boot sweep, not live — an accepted trade-off given the chosen boot-sweep-only design (no live timer/`visibilitychange` watcher was introduced, per explicit decision).

# Data Retention & Cleanup Strategy

### Problem
The app is moving state from ephemeral `KeepAlive`/in-memory storage to `localStorage`, which persists forever by default. Without a cleanup policy, stale data (e.g. from a match that ended weeks ago) would linger indefinitely and could even resurface unexpectedly in a future session.

### Options Considered
1. **Time-based rolling TTL (chosen)** — expire data 6h after the *last* write. Simple, automatic, matches the "alive for the duration of a match" requirement without risking wiping an active match that runs slightly long.
2. **Time-based fixed TTL from session start** — rejected as the sole mechanism: a match legitimately running past 6h would lose its live score/state mid-play, which is worse UX than leaving mildly-stale data around a bit longer.
3. **Manual-only cleanup (explicit "End Battle" reset)** — rejected as the *sole* mechanism: relies entirely on the user remembering to reset; useful as a future complement (the `battleSession` store's `$reset()` is kept available for this), but not a substitute for automatic expiry.
4. **Storage-quota / LRU eviction** — rejected: this app's persisted payloads are tiny (a handful of scalars/ids), so quota pressure is not a realistic concern; adding LRU logic would be unjustified complexity.
5. **`sessionStorage` instead of `localStorage`** — rejected: `sessionStorage` clears on tab close, which defeats the explicit goal of surviving app close/reopen during a multi-hour match.

### Chosen Approach
- **Rolling TTL of 6h**, refreshed automatically on every store mutation (a natural side effect of `pinia-plugin-persistedstate` re-serializing on every change) — no bespoke "keep-alive ping" logic needed.
- **Per-store expiring serializer**: `createExpiringSerializer(SIX_HOURS_MS)` wraps persisted data as `{ savedAt, value }`; on read, data older than the TTL is treated as absent (store falls back to its defaults).
- **One-time boot sweep**: `pruneExpiredStores()` runs in `main.js` before the app mounts, physically removing expired `localStorage` entries so the app never even transiently loads stale data.
- **Scope of the TTL**: only session-scoped, match-relevant data (`battleSession` store — scores) gets the TTL. The `carousels` store and the `filterOperations` store (future CritTacOps filter-selection state) are durable UI/browsing preferences (tiny, non-sensitive) and persist without expiry.

### Accepted Limitations
- Expiry is only re-evaluated at app boot, not continuously while the app stays open and idle — acceptable given this is a mobile companion app that gets backgrounded/reopened rather than left in one continuous foreground session for 6+ hours.
- No cross-device sync — `localStorage` is inherently per-browser/per-device; out of scope for this migration.

# Testing

### Validation Approach
The project has no automated test runner configured (`package.json` has no `vitest`/`jest`/etc.), so validation is done by running the dev server (`npm run dev`) and manually exercising the flows below, plus direct inspection of `localStorage` via devtools/console.

### Key Scenarios
- Navigate `/` → `/ops` → `/battle` → back to `/` repeatedly: confirm each view fully mounts (e.g. via a temporary `console.log` in `onMounted`) and no `KeepAlive`-related warnings appear.
- On the Rules carousel, scroll to slide 3, navigate to `/ops` and back to `/`: confirm the carousel resumes at slide 3 (mirrors previous `onActivated` behavior). Repeat independently for the Crit/Tac Ops carousel.
- Reload the page after interacting with the Rules carousel: confirm the position still restores from `localStorage` (`carousels` key present).
- Trigger a `battleSession` mutation (e.g. via store devtools or a temporary call incrementing `commandPoints`), inspect `localStorage['battleSession']` and confirm it contains a `savedAt` timestamp alongside the value.
- Manually edit `localStorage['battleSession']`'s `savedAt` to a value older than 6h, reload the app, and confirm the boot sweep removes the key and the store hydrates with defaults.
- Trigger an `filterOperations` store mutation (e.g. `addOperation`), reload the page, and confirm the raw value persists in `localStorage['operations']` without a `{ savedAt, value }` wrapper (i.e. it is not subject to the TTL serializer).
- Temporarily shrink the `carouselItems` array passed to the Crit/Tac Ops `KTCarousel` (simulating a future filter) after a position was saved for an item no longer in the list: confirm `onMounted` falls back to slide 0 with no console errors, instead of failing to resolve the saved id.

### Edge Cases
- First-ever load with empty `localStorage`: all stores hydrate to their defaults with no console errors.
- Corrupted/malformed JSON manually placed under the `battleSession` key: boot sweep and/or serializer's `deserialize` must fail gracefully (treat as expired/absent) rather than throwing.
- `filterOperations` store data present from before this migration: it keeps loading normally, since its persistence and shape are unchanged by this migration.
- Dev-only `/sandbox` route (excluded from production builds) is unaffected by the `KeepAlive` removal since it was never part of the cached tree in a meaningful way.
- Persisted `carousels` position references an item `id` that no longer exists in `carouselItems` (e.g. filtered out by the future CritTacOps search/filter feature) or the list is empty: `KTCarousel.vue` falls back to slide 0 rather than throwing.

# Delivery Steps

### ✓ Step 1: Write the migration design document
A committed `.requirements/state-persistence-migration.md` captures the agreed goals, the three confirmed key decisions, and the file-level change list for this migration.
- Create the `.requirements/` directory and add `state-persistence-migration.md`.
- Summarize the goals: drop `<KeepAlive>`, migrate component state into persisted Pinia stores, define the localStorage cleanup strategy.
- Document the three confirmed decisions: rolling 6h TTL (refreshed on last activity), per-store expiring serializer plus a boot-time sweep, and keeping the new `battleSession` store (scores only) separate from the existing `filterOperations` store, which is reclassified as durable filter-selection state for the future CritTacOps search/filter feature and excluded from the TTL.
- List every file touched by the migration (new, modified, removed) for future reference.

### ✓ Step 2: Build the shared expiring-persistence utility and boot-time sweep
A reusable helper lets any Pinia store opt into a rolling TTL, and stale entries are purged once at app startup before stores hydrate.
- Add `src/stores/plugins/persistExpiry.js` exporting `SIX_HOURS_MS`, `createExpiringSerializer(ttlMs)` (wraps state as `{ savedAt, value }`, refreshed on every write, discarded on read once older than `ttlMs`), and `pruneExpiredStores()`.
- Define a small internal registry of session-scoped store keys/TTLs (starting with `battleSession`) inside the same module.
- Call `pruneExpiredStores()` in `src/main.js` before `app.mount('#app')`.

### ✓ Step 3: Migrate carousel position into a store and rework KTCarousel's activation hook
The "resume last viewed slide" behavior works identically without relying on `<KeepAlive>`, and stays correct even once a future filter can shrink or reorder the Crit/Tac Ops card list.
- Implement `src/stores/carousels.js` (`useCarouselStore`) with a `positions` map plus `getPosition(carouselId)` / `setPosition(carouselId, itemId)`, storing each carousel's last-viewed item **id** (not a raw index), using plain `persist: true` (no TTL — a durable UI preference).
- Add a required `carouselId` prop to `src/components/KTCarousel.vue`; remove the `onActivated` hook and move the slide-restore logic into the existing `onMounted` hook, resolving the saved item id to an index via `carouselItems.findIndex(...)` and defaulting to `0` when the id isn't found (e.g. filtered out) or the list is empty.
- Update `handleSelect` in `KTCarousel.vue` to also call `setPosition(carouselId, carouselItems[index]?.id)` on every slide change, keeping the existing collapsed-snap-list `reInit` safety net as a second layer of defense.
- Pass a unique `carousel-id` (`"rules"`, `"crit-tac-ops"`) from `src/views/Rules.vue` and `src/views/CritTacOps.vue` when using `<KTCarousel>`.

### ✓ Step 4: Remove KeepAlive from App.vue
Route navigation always fully mounts/unmounts view components, with no visible regression thanks to the previous stage's carousel-store fix.
- Replace `<KeepAlive :max="10"><component :is="Component" ref="routedComponent" /></KeepAlive>` in `src/App.vue` with a plain `<component :is="Component" ref="routedComponent" />` inside the `router-view` slot.
- Remove the now-inaccurate "view is already cached by App.vue's KeepAlive" comment in `src/views/CritTacOps.vue`.
- Update the "safety net" comment in `src/components/KTCarousel.vue` to describe the new mount-based restore instead of the old activation-based one.

### ✓ Step 5: Add a dedicated persisted battleSession store for BattleBoard scores
BattleBoard's scores move into a small rolling-TTL store, while the existing `filterOperations` store is left untouched and excluded from the TTL sweep.
- Create `src/stores/battleSession.js` (`useBattleSessionStore`) holding only `commandPoints`/`factionPoints` state and a `$reset()`.
- Configure `battleSession.js`'s persistence as `persist: { serializer: createExpiringSerializer(SIX_HOURS_MS) }` from the Stage 2 utility.
- Update `src/views/BattleBoard.vue` to read/write `commandPoints`/`factionPoints` through `useBattleSessionStore()` instead of local `ref`s, preserving the existing `onMounted` console logging behavior.
- Leave `src/stores/operations.js` unchanged in code, and do not add its key to the TTL registry, so it keeps plain, non-expiring persistence in anticipation of the future CritTacOps search/filter feature.
