---
sessionId: session-260816-152125-149g
---

# Requirements

### Overview & Goals
The Crit/Tac Ops filter panel on `CritTacOps.vue` currently shares a single filter-state array (`filteredOperations`) between two conceptually independent lists: Crit Ops and Tac Ops. Because visibility of both card types is gated by one shared `isFiltering` flag, selecting a filter for one type (e.g. Crit Ops) incorrectly hides all cards of the *other* type (Tac Ops) that have no filter applied to them yet.

Goal: refactor `src/stores/filterOperations.js` and `src/views/CritTacOps.vue` so Crit Ops and Tac Ops each have their own independent filter state. Filtering one type must never affect the visibility of the other type.

### Scope
**In Scope**
- Splitting the filter store state into two independent structures: one for Crit Ops ids, one for Tac Ops ids.
- Updating `CritTacOps.vue` filter selection (`critOpsFilter` / `tacOpsFilter`) and carousel visibility logic (`carouselItems`) to use the correct independent structure per card type.
- Updating the active filter counter and the reset button to work correctly with the new two-structure model.

**Out of Scope**
- Changes to `src/stores/critTacOps.js` (catalog data) — unaffected.
- Changes to `CritCard.vue` / `TacCard.vue` presentation components.
- Adding new UI (e.g. separate reset buttons per type) beyond what's needed to fix the bug.

### User Stories
- As a user, when I filter Crit Ops, I want all Tac Op cards to remain visible (since I haven't filtered Tac Ops), so I can still browse them.
- As a user, when I filter Tac Ops, I want all Crit Op cards to remain visible, symmetrically.
- As a user, when I filter both Crit Ops and Tac Ops at once, I want only the matching cards of each type to show.
- As a user, clicking the reset (trash) button should clear both filters and show every card again, same as today.

### Functional Requirements
- Selecting/deselecting items in the "Crit Ops" `USelect` must only affect Crit Op card visibility.
- Selecting/deselecting items in the "Tac Ops" `USelect` must only affect Tac Op card visibility.
- When a type has no active filter, all cards of that type are shown (current behavior for the *global* case must now apply per type).
- The "Filtri (n)" badge count must reflect the total number of active filters across both types (same as before, just now computed from two arrays).

# Technical Design

### Current Implementation
- `src/stores/filterOperations.js` keeps a single `filteredOperations` ref holding ids from *both* Crit and Tac ops mixed together. `isFiltering` and `isOperationPresent` operate on this single array. Note: there's already a dead/unused `filteredTacOps` ref (line 9) — a sign this split was intended but never finished.
- `src/views/CritTacOps.vue`:
  - `critIds`/`tacIds` are derived once from the catalog to *scope* the shared array back into two logical subsets (lines 13-14).
  - `applyFilterSelection(newIds, scopeIds)` (lines 16-20) manually filters `filterOpStore.filteredOperations` by `scopeIds` to figure out what changed — a workaround for the shared structure.
  - `carouselItems` (lines 37-51) gates both Crit and Tac cards using the **same** global `filterOpStore.isFiltering` flag — this is the root cause: if `filteredOperations` has any Crit ids, `isFiltering` becomes `true` for the whole store, so Tac cards get filtered by `isOperationPresent` even though no Tac filter was set, hiding them all.

### Key Decisions
- **Two arrays in one store, not two stores.** Keep a single `useFilterOperationStore` (still responsible for "operation filter selection" as a whole) but back it with two independent refs: `filteredCritOps` and `filteredTacOps`. Splitting into two Pinia stores would fragment state/persistence unnecessarily for what is still one UI concern (the Crit/Tac Ops filter panel).
- **Explicit per-type public API, DRY internal implementation.** Internally, a small type-keyed helper (`crit` | `tac` → ref) avoids duplicating the add/remove/present logic twice. Externally, the store exposes explicit, readable methods (`addCritOperationFilter`, `addTacOperationFilter`, `isCritOperationPresent`, `isTacOperationPresent`, etc.) so `CritTacOps.vue` never has to pass magic type strings around.
- **`$reset()` clears both.** Keeps parity with the current single trash-icon button behavior; independent per-type state is still addressable if needed later.
- **Drop the scope-filtering workaround in the view.** Since each type now owns its own array, `critIds`/`tacIds`/`applyFilterSelection`'s `scopeIds` parameter are no longer needed — the store already returns exactly the right subset.

### Proposed Changes
**`src/stores/filterOperations.js`**
- Replace `filteredOperations` with `filteredCritOps` and use the existing (currently dead) `filteredTacOps` ref for its intended purpose.
- Replace `getFilteredOperations` / `isFiltering` / `isOperationPresent` / `addOperationFilter` / `removeOperationFilter` with per-type equivalents.
- Update `$reset()` to clear both arrays.

**`src/views/CritTacOps.vue`**
- Remove `critIds` / `tacIds` derivation (no longer needed for scoping).
- Simplify `applyFilterSelection` to take the current ids + add/remove callbacks for the relevant type only (no scope filtering).
- Update `critOpsFilter` / `tacOpsFilter` computed to read/write via the new per-type store getters/methods.
- Update `activeFilterCount` to sum both arrays' lengths.
- Fix `carouselItems`: gate Crit cards on `isFilteringCrit` / `isCritOperationPresent`, and Tac cards on `isFilteringTac` / `isTacOperationPresent` — this is the actual bug fix.

### Data Models / Contracts
```js
// Store state
filteredCritOps: Array<string|number>  // ids of Crit Ops currently filtered
filteredTacOps:  Array<string|number>  // ids of Tac Ops currently filtered

// Store public API (replaces the current shared-structure API)
getFilteredCritOps: ComputedRef<Array>
getFilteredTacOps:  ComputedRef<Array>
isFilteringCrit:    ComputedRef<boolean>
isFilteringTac:     ComputedRef<boolean>
isCritOperationPresent: ComputedRef<(opId) => boolean>
isTacOperationPresent:  ComputedRef<(opId) => boolean>
addCritOperationFilter(opId)
removeCritOperationFilter(opId)
addTacOperationFilter(opId)
removeTacOperationFilter(opId)
$reset()
```

### Components
- `src/stores/filterOperations.js` — core state split, all mutation/query logic reworked to be per-type.
- `src/views/CritTacOps.vue` — consumes the new per-type API for the two `USelect` filters and for `carouselItems` visibility logic; this is where the reported bug actually manifests and gets fixed.
- No changes to `CritCard.vue`, `TacCard.vue`, or `src/stores/critTacOps.js`.

### Risks
- `persist: true` on the store means the old `filteredOperations` key may linger in local storage; harmless since it's simply no longer read, and the new `filteredCritOps` / `filteredTacOps` keys start fresh (equivalent to today's first-load state).
- Any other file relying on the old store API would break — verified via repo-wide search that `useFilterOperationStore` is only consumed by `CritTacOps.vue`, so this is safe.

# Testing

### Validation Approach
No automated test suite exists for stores/views in this project (no `*.spec.js`/`*.test.js` found, no test runner configured), so validation will be done by tracing the updated logic and, where practical, running the dev server to click through the filter UI.

### Key Scenarios
- Filter only Crit Ops (select one or more items in "Crit Ops" select) → only matching Crit cards show, **all** Tac cards remain visible.
- Filter only Tac Ops → only matching Tac cards show, **all** Crit cards remain visible.
- Filter both Crit Ops and Tac Ops simultaneously → only matching cards of each respective type show.
- Clear a Crit Ops filter selection back to empty → all Crit cards reappear, Tac filtering (if any) stays unaffected.
- Click the trash/reset button → both filters clear and all cards reappear; "Filtri (n)" badge resets to 0.

### Edge Cases
- No filters applied at all (initial state) → all Crit and Tac cards visible, exactly as today.
- Filtering to a selection with no matching ops for one type while the other type has an active filter → confirm each type's empty/non-empty state is independent.
- Ensure `activeFilterCount` correctly reflects `filteredCritOps.length + filteredTacOps.length` after mixed add/remove operations.

# Delivery Steps

### * Step 1: Split filter state into independent Crit/Tac structures in the store
The `filterOperations` Pinia store tracks Crit Ops and Tac Ops filter selections as two fully independent arrays instead of one shared array.
- Replace the single `filteredOperations` ref with `filteredCritOps`, and repurpose the existing unused `filteredTacOps` ref for Tac Ops.
- Add per-type computed getters: `getFilteredCritOps`, `getFilteredTacOps`.
- Add per-type computed flags: `isFilteringCrit`, `isFilteringTac`.
- Add per-type presence checks: `isCritOperationPresent(opId)`, `isTacOperationPresent(opId)`.
- Add per-type mutation methods: `addCritOperationFilter`, `removeCritOperationFilter`, `addTacOperationFilter`, `removeTacOperationFilter`.
- Update `$reset()` to clear both `filteredCritOps` and `filteredTacOps`.
- Remove the now-obsolete shared API (`filteredOperations`, `getFilteredOperations`, `isFiltering`, `isOperationPresent`, `addOperationFilter`, `removeOperationFilter`) from the store's return object.

### ✓ Step 2: Wire CritTacOps.vue filter selects to the per-type store API
The Crit Ops and Tac Ops `USelect` filter fields read from and write to their own independent store arrays, with no cross-scoping logic left in the component.
- Remove `critIds`/`tacIds` derivation from `critFilterItems`/`tacFilterItems`, since scoping is no longer needed.
- Simplify `applyFilterSelection` to accept the current ids plus add/remove callbacks for a single type, dropping the `scopeIds` filtering workaround.
- Update the `critOpsFilter` computed to get/set via `filterOpStore.getFilteredCritOps` / `addCritOperationFilter` / `removeCritOperationFilter`.
- Update the `tacOpsFilter` computed to get/set via `filterOpStore.getFilteredTacOps` / `addTacOperationFilter` / `removeTacOperationFilter`.
- Update `activeFilterCount` to sum `getFilteredCritOps.length + getFilteredTacOps.length`.

### ✓ Step 3: Fix carousel visibility to gate Crit and Tac cards independently
Filtering Crit Ops no longer hides Tac Op cards and vice versa, resolving the reported bug.
- Update the `carouselItems` computed in `CritTacOps.vue` so the Crit Ops loop checks `!filterOpStore.isFilteringCrit || filterOpStore.isCritOperationPresent(el.id)`.
- Update the Tac Ops loop to check `!filterOpStore.isFilteringTac || filterOpStore.isTacOperationPresent(el.id)`.
- Manually verify via the dev server: filtering only Crit Ops leaves all Tac cards visible, filtering only Tac Ops leaves all Crit cards visible, filtering both restricts each type independently, and the reset button clears both and restores the full card list.