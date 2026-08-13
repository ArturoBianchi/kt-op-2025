---
sessionId: session-260813-110752-bvzq
---

# Requirements

### Overview & Goals
- Fix the regression where returning to `Rules.vue` / `CritTacOps.vue` no longer visually restores the previously-viewed carousel slide, even though `KTCarousel.vue` correctly reads the saved item id from `useCarouselStore()`.
- Root-cause it purely from code (Embla + `@nuxt/ui` internals + our own component), without needing live browser debugging.
- Keep the fix small, readable and effective — no new state, no new UI, no behavior change beyond making the restore reliably work again.

### Scope
**In Scope**
- `src/components/KTCarousel.vue`: how the initial slide index is computed, how it's fed into `UCarousel`, and how the post-mount "safety net" re-check works.
- Removing the stray `debugger;` statement left in `onMounted` from a prior investigation.

**Out of Scope**
- The future CritTacOps search/filter feature (already anticipated by `resolveIndexFromSavedId`'s id-based lookup, per the existing comment) — not implemented here.
- Any change to `src/stores/carousels.js`'s shape or persistence strategy.
- Adding an automated test suite (none exists in the project — no test runner in `package.json`).

### Functional Requirement
- After navigating away from a view containing `<KTCarousel>` and back (full remount, no `KeepAlive`), the carousel must visually resume at the slide corresponding to the id saved in `useCarouselStore()`, on every visit — not just intermittently.
- The behavior for a brand-new carousel id (no saved position yet) is unchanged: it starts at slide 0.

# Technical Design

### Current Implementation
`src/components/KTCarousel.vue` (current `onMounted`):
```js
onMounted(() => {
    debugger;
    lastIndex.value = resolveIndexFromSavedId()

    const embla = carouselRef.value?.emblaApi
    if (!embla) return
    slideObserver = new ResizeObserver(remeasureIfSlidesChanged)
    embla.on('reInit', observeSlides)
    observeSlides()

    requestAnimationFrame(() => {
        if (!embla || embla.selectedScrollSnap() === lastIndex.value) return
        if (embla.scrollSnapList().length <= lastIndex.value) embla.reInit()
        embla.scrollTo(lastIndex.value, true)
    })
})
```
`<UCarousel>` is used in the template **without a `start-index` prop**, so Embla always constructs itself at slide 0; the only mechanism that's supposed to move it to the saved slide is the imperative `scrollTo` above.

### Root Cause (traced through library source, not guesswork)
Three facts combine into the bug:
1. **Embla defers its `init` event.** In `node_modules/embla-carousel/esm/embla-carousel.esm.js:1664`: `setTimeout(() => eventHandler.emit('init'), 0)` — the `init` event is emitted on a macrotask, not synchronously during construction.
2. **`@nuxt/ui`'s `Carousel.vue` re-broadcasts `init` as a `select` event.** In `node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue:147-156`, `onMounted` registers `emblaApi.value.on('init', onSelect)` (not just `onInit`). `onSelect` (lines 138-143) always does `selectedIndex.value = api.selectedScrollSnap(); emits('select', selectedIndex.value)`. Since `startIndex` was never passed, `selectedScrollSnap()` at this point is `0` — so **every mount emits a phantom `@select(0)` shortly after mount**, even with zero user interaction.
3. **`KTCarousel.vue`'s `handleSelect` unconditionally overwrites both the local index and the persisted store value:**
```js
const handleSelect = (index) => {
    lastIndex.value = index
    carouselStore.setPosition(props.carouselId, props.carouselItems[index]?.id)
}
```
This phantom `@select(0)` fires via a `setTimeout(0)` macrotask scheduled *during the child's mount* (before our own `onMounted` even runs), while our "safety net" `requestAnimationFrame` is scheduled *after*, during the parent's `onMounted`. In practice the macrotask resolves before that later-scheduled animation frame renders, so by the time the safety net's callback runs, `handleSelect(0)` has already reset `lastIndex.value` back to `0`. The check `embla.selectedScrollSnap() === lastIndex.value` then reads `0 === 0` → **true** → the function returns before ever reaching `embla.scrollTo(...)`. This matches the reported symptom exactly: the saved index was read correctly, but `scrollTo` is never reached.
- A second, compounding effect: because `handleSelect(0)` also calls `carouselStore.setPosition(...)` with slide 0's id, **the persisted position itself gets silently corrupted back to slide 0 on every mount**, regardless of whether the visual jump happens to succeed. This is why the problem looks permanent rather than occasionally flaky.

### Key Decision
**Feed Embla the correct `start-index` at construction time, instead of constructing at 0 and imperatively jumping afterwards.** `resolveIndexFromSavedId()` only depends on `props.carouselItems` (static per mount today) and the already-hydrated `carouselStore` (Pinia + `pinia-plugin-persistedstate` hydrates synchronously on store creation) — both available before the template even renders. Passing this as `UCarousel`'s existing `start-index` prop (`Carousel.vue:41`, forwarded to Embla via `rootProps`) means the *first* `selectedScrollSnap()` — and thus the phantom `@select` echo — already reports the correct index. There is no longer a wrong value to race against or correct after the fact. This is simpler than patching the race with extra guard flags, and it also fixes the store-corruption side effect for free.
The post-mount `requestAnimationFrame` block is kept, but narrowed to its one legitimate remaining job: Embla may still clamp/trim `start-index` if `scrollSnapList()` is shorter than expected at construction (e.g. slides not fully measurable yet). To avoid re-introducing the same race, this check must compare against the original, immutable `initialIndex` — not the mutable `lastIndex.value`, which legitimately changes as soon as any real `select` event (including the now-correct phantom one) fires.

### Verified Safety: Manual Slides Don't Reactively Corrupt the Carousel
A related concern was checked: every real slide interaction fires `handleSelect`, which updates `lastIndex.value` and calls `carouselStore.setPosition(...)` — so while the user stays on the same page (no navigation/remount), the store keeps getting rewritten on every single slide. The question was whether this could feed back into `start-index` and disturb the slide currently in progress, purely from staying on the page rather than from a fresh mount.
- Traced through `@nuxt/ui`'s `Carousel.vue`: `startIndex` is picked into `rootProps` (`Carousel.vue:53`) and spread into a `computed` named `options` (`Carousel.vue:59-64`), which is watched at `Carousel.vue:99-101` — any change to `options` (including a changed `startIndex`) triggers `emblaApi.value?.reInit(options.value, plugins.value)` on the **already-mounted** Embla instance.
- If `initialIndex`/`start-index` were ever made reactive (e.g. a `computed` re-deriving from `lastIndex.value` or reading the store live), every `handleSelect` would re-trigger this `reInit`, snapping the carousel back and corrupting the very slide the user just performed — while still on the same page, not from a fresh mount.
- The fix avoids this entirely by design: `initialIndex` is a **plain, non-reactive `const`**, computed once at `<script setup>` top level and never reassigned. `lastIndex` and the store update on every slide exactly as before, but neither is ever read back into a prop bound onto `<UCarousel>`, so `props.startIndex` inside `Carousel.vue` never changes after mount and the `watch(options, ...) → reInit()` path is never re-triggered by ordinary sliding. No extra code beyond keeping this invariant is required — it is captured explicitly as a guarding comment (see Proposed Changes) and a regression scenario (see Testing).

### Proposed Changes
- **`src/components/KTCarousel.vue`**
  - Compute `const initialIndex = resolveIndexFromSavedId()` once, at `<script setup>` top level (right after `resolveIndexFromSavedId` is declared), instead of inside `onMounted`. Initialize `const lastIndex = ref(initialIndex)`.
  - Add a short comment directly above `initialIndex` documenting that it must stay a plain, non-reactive constant — never a `computed`/`ref` re-deriving from `lastIndex` or the store — because doing so would feed back into `start-index` and re-trigger `@nuxt/ui`'s internal `reInit()` (`Carousel.vue:99-101`) on every slide selection, corrupting the in-progress slide while still on the same page.
  - Add `:start-index="initialIndex"` to the `<UCarousel>` template binding.
  - In `onMounted`, drop `lastIndex.value = resolveIndexFromSavedId()` (now redundant) and remove the leftover `debugger;` statement.
  - Change the safety-net check to reference `initialIndex` instead of `lastIndex.value`:
    ```js
    requestAnimationFrame(() => {
        if (!embla || embla.selectedScrollSnap() === initialIndex) return
        if (embla.scrollSnapList().length <= initialIndex) embla.reInit()
        embla.scrollTo(initialIndex, true)
    })
    ```
  - Update the two Italian comments above `resolveIndexFromSavedId` and above the safety net to describe the corrected flow: the index is now resolved *before* Embla is created and passed in as `start-index`; the `requestAnimationFrame` block is a defensive fallback only for the case Embla couldn't yet measure enough slides at construction time.

### Data Models / Contracts
No store or prop contract changes. `KTCarousel.vue`'s public props (`carouselItems`, `carouselId`, `dots`, `arrows`, `autoHeight`) stay identical; `useCarouselStore()`'s `getPosition`/`setPosition` API is unchanged.

### Components
- `KTCarousel.vue` — only file touched: initial-index resolution moves earlier and is passed as `start-index`; the mount-time safety net is corrected to stop racing with the store-writing `@select` handler.
- `Rules.vue` / `CritTacOps.vue` — no changes needed; they already pass `carousel-id` and will transparently benefit from the fix.

### File Structure
```
src/
  components/
    KTCarousel.vue   (modified: eager initialIndex, start-index prop, corrected safety net, debugger removed)
```

### Risks
- **Late-measured slides at construction** (e.g. images not yet decoded) could still make Embla clamp `start-index` to fewer snaps than intended; this is exactly what the retained `requestAnimationFrame` fallback (`reInit()` + `scrollTo`) exists to correct, now checked against a stable, race-free `initialIndex`.
- **Future dynamic filtering** (search/filter on CritTacOps, previously discussed) will change `carouselItems` *without* a remount; `initialIndex` is only computed once at setup and won't react to that. This is explicitly out of scope here — the existing id-based `resolveIndexFromSavedId` design was already built anticipating that feature, and re-resolving position on a live list change is a separate, future concern.
- **Accidental reactive `start-index`**: if a future change (e.g. that same search/filter feature) re-derives `initialIndex`/`start-index` reactively from `lastIndex` or the store instead of keeping it a one-time constant, it would re-trigger `@nuxt/ui`'s `watch(options, ...) → reInit()` (`Carousel.vue:99-101`) on every slide, visually corrupting the slide in progress even without navigating away. Verified this does not happen with the current design; the guarding comment added in Proposed Changes exists specifically to prevent this regression.

# Testing

### Validation Approach
No automated test runner exists in this project; validation is manual via the dev server (`npm run dev`) plus a final `npm run build` sanity check, consistent with how this area was previously validated.

### Key Scenarios
- On the Rules carousel, scroll to slide 3 (or any non-zero slide), navigate to `/ops`, then back to `/`: confirm the carousel visually resumes at slide 3 immediately after mount (no visible flash back to slide 0 first).
- Repeat the same check independently for the Crit/Tac Ops carousel (`/ops`).
- After returning and restoring correctly, inspect `localStorage['carousels']` and confirm the saved id still matches the restored slide (i.e. it wasn't silently reset back to the first item's id by a phantom select).
- Reload the page (full page refresh, not just SPA navigation) after scrolling to a non-zero slide: confirm the position still restores from `localStorage` on a cold load.
- First-ever visit with no saved id yet: confirm the carousel still starts at slide 0 with no console errors.
- Without navigating away, manually click/drag through several slides in a row on both carousels: confirm each slide settles smoothly with no visual snap-back or flicker after each one, and that `localStorage['carousels']` updates to match the latest slide after every click (i.e. no `reInit`-triggered jump while staying on the page).

### Edge Cases
- Rapidly navigating away and back multiple times in succession: confirm the restored index remains stable each time (no drift toward slide 0).
- `carouselItems` list where the previously-saved id is no longer present (simulating a future filter removing that item): confirm it falls back to slide 0, as `resolveIndexFromSavedId` already handles.
- Confirm `initialIndex`/`start-index` is never turned into a reactive value by a later change (e.g. the future search/filter feature) — doing so would re-trigger `Carousel.vue`'s `reInit()` on every slide selection (see Risks).
- Confirm `npm run build` still completes with no errors/warnings after the change.

# Delivery Steps

### ✓ Step 1: Seed Embla's start index from the saved position instead of jumping after mount
KTCarousel.vue constructs its UCarousel already positioned at the saved slide, removing the need to imperatively jump to it afterwards.
- In `src/components/KTCarousel.vue`, compute `const initialIndex = resolveIndexFromSavedId()` once at `<script setup>` top level (moved out of `onMounted`), and initialize `const lastIndex = ref(initialIndex)`.
- Add `:start-index="initialIndex"` to the `<UCarousel>` binding in the template so Embla is created already at the correct slide.
- Remove the now-redundant `lastIndex.value = resolveIndexFromSavedId()` line and the leftover `debugger;` statement from `onMounted`.
- Update the comment above `resolveIndexFromSavedId` to reflect that its result is now consumed before Embla is constructed, not after.
- Add a comment above `const initialIndex = resolveIndexFromSavedId()` stating it must remain a plain, non-reactive constant, so that ongoing `handleSelect` updates to `lastIndex`/the store during normal sliding never feed back into `start-index` and re-trigger a `reInit` on the mounted carousel.

### ✓ Step 2: Correct the post-mount safety net to stop racing with the store-writing select handler
The requestAnimationFrame fallback in onMounted only corrects genuinely under-measured slides and no longer gets defeated by the carousel's own initial select echo.
- In `src/components/KTCarousel.vue`, change the `requestAnimationFrame` safety-net checks (`embla.selectedScrollSnap() === lastIndex.value`, `embla.scrollSnapList().length <= lastIndex.value`, `embla.scrollTo(lastIndex.value, true)`) to compare against the stable `initialIndex` constant instead of the mutable `lastIndex.value`.
- Update the Italian "Rete di sicurezza" comment to describe its narrowed role: a defensive fallback for slides that weren't fully measurable when Embla was constructed, not the primary restore mechanism.
- Run `npm run build` to confirm the change compiles cleanly, then manually verify in `npm run dev` that navigating away from and back to `/` and `/ops` restores the previously-viewed slide every time, and that `localStorage['carousels']` keeps the correct saved id afterwards.
- While staying on the same page, manually click through several slides in a row on both carousels and confirm no snap-back/flicker occurs after each click, verifying that `lastIndex`/store updates from `handleSelect` never reactively feed back into `start-index` and re-trigger `@nuxt/ui`'s `reInit()` (`Carousel.vue:99-101`).