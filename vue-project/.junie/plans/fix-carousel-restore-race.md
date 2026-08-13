---
sessionId: session-260813-110752-bvzq
---

# Requirements

### Overview & Goals
- Answer: **yes** — `@nuxt/ui`'s Vite plugin (the `ui()` call in `vite.config.js`) accepts a `ui` option with the exact same shape as Nuxt's `app.config.ts` `ui` key, and it is merged into every component's runtime theme app-wide. This was confirmed by reading `@nuxt/ui`'s own source, not by guessing (see Technical Design).
- Migrate the `USelect` dropdown-font fix — currently a per-instance `:ui="selectDropdownUi"` prop duplicated on both `USelect`s in `src/views/CritTacOps.vue` — into a single global override in `vite.config.js`, alongside the existing `ui({ colorMode: false })` call.
- Net effect for the user is **zero visual change**: the dropdown options keep rendering in the app's monospace font exactly as today. The only thing that changes is *where* that rule lives, so any future `USelect` added anywhere in the app gets the fix automatically instead of needing the prop copy-pasted again.

### Scope
**In Scope**
- `vite.config.js`: add a global Nuxt UI theme override for the `select` component's `content` slot.
- `src/views/CritTacOps.vue`: remove the now-redundant local `selectDropdownUi` object and the two `:ui="selectDropdownUi"` bindings, since the global override supersedes them.

**Out of Scope**
- Any other component's theme (only the `select` popup-font issue is being relocated; no new design-system-wide theme file is introduced).
- The `--ui-*` CSS variable bridge in `src/assets/css/theme.css` (a separate mechanism — CSS custom properties consumed by all components' Tailwind classes — untouched by this change).
- Any change to `USelect`'s behavior, props, or the `CritTacOps.vue` filter feature itself (still scaffolded/commented-out).

### Functional Requirements
- After the change, both `USelect` dropdowns in `CritTacOps.vue` ("Crit Ops" / "Tac Ops" filters) still render their popup option list in the app's monospace font (`"JetBrains Mono", monospace`), matching the trigger — identical to the current behavior, just sourced from `vite.config.js` instead of the view file.
- Any `USelect` instance added to the app in the future (no such usage exists elsewhere today) automatically inherits the same monospace-popup styling with zero extra code in that new location.
- A component-level `:ui` prop, if ever added back on a specific instance, must still be able to override the global default for that one instance (this is Nuxt UI's own documented precedence — the plan does not need to build this, only avoid breaking it).

# Technical Design

### Current Implementation
- `vite.config.js` currently registers Nuxt UI as:
```js
ui({
    colorMode: false,
})
```
- `src/views/CritTacOps.vue` currently defines the font override locally and applies it twice:
```js
// Il pannello a tendina di USelect viene teleportato fuori da .app-wrapper
// (che in App.vue imposta font-family: var(--font-mono) per tutta l'app),
// quindi le opzioni erediterebbero il font di fallback di <body> (--font-main)
// invece del monospace usato ovunque nell'interfaccia. La prop "ui" del
// componente e' il modo corretto per personalizzarlo: forza font-mono sullo
// slot "content" del popup, da cui le opzioni ereditano il font per cascata.
const selectDropdownUi = { content: 'font-mono' }
```
```html
<USelect v-model="selectMultiple1" multiple :items="items" placeholder="Filtra..." class="w-full" :ui="selectDropdownUi" />
...
<USelect v-model="selectMultiple2" multiple :items="items" placeholder="Filtra..." class="w-full" :ui="selectDropdownUi" />
```
- `src/assets/css/theme.css` already bridges Nuxt UI's `--ui-*` CSS variables (colors, radius, borders) to the app's own design tokens, but that mechanism only covers CSS custom properties — it cannot express "give this specific slot the `font-mono` utility class", which is a Tailwind Variants slot override, a different customization layer.

### Investigation — confirming the vite.config.js-level option actually works
Traced this end-to-end through `@nuxt/ui`'s installed source (not just the docs) to make sure the claim is accurate for this project's *Vite-only* (non-Nuxt) setup:
1. `node_modules/@nuxt/ui/dist/unplugin.d.mts:42-45` — the options object accepted by `ui()` (`NuxtUIOptions`) declares `ui?: AppConfigUI`, i.e. a `ui` key with the same Tailwind-Variants-config shape used in `app.config.ts` for full Nuxt apps.
2. `node_modules/@nuxt/ui/dist/unplugin.mjs:215-219` — at plugin setup time: `const appConfig = defu({ ui: options.ui, colorMode: options.colorMode }, { ui: getDefaultUiConfig(options.theme.colors) })`. Whatever is passed as `ui.ui` in `vite.config.js` is merged straight into this `appConfig.ui`.
3. `node_modules/@nuxt/ui/dist/unplugin.mjs:89-103` (`AppConfigPlugin`) — this `appConfig` is serialized into a virtual module resolved as `#build/app.config`, which is exactly what every Nuxt UI component reads via `useAppConfig()`.
4. `node_modules/@nuxt/ui/dist/runtime/components/Select.vue:59,68` — `Select.vue` calls `const appConfig = useAppConfig()` and computes its runtime theme as `tv({ extend: tv(theme), ...appConfig.ui?.select || {} })(...)`, i.e. anything under `appConfig.ui.select` (slots, variants, etc.) is merged on top of the component's built-in theme, for **every** `USelect` instance in the app.
5. `node_modules/@nuxt/ui/.nuxt/ui/select.ts:42` confirms the exact slot key needed: `"content": "max-h-60 ... bg-default ..."` is the teleported popup panel — the same slot already targeted by the current per-instance fix.

Conclusion: passing `ui({ ui: { select: { slots: { content: 'font-mono' } } } } )` to the Vite plugin is not a workaround — it is the exact same override path as Nuxt's documented `app.config.ts` global config, just exposed through the Vite plugin's own `ui` option, and it reaches every `USelect` in the app, current and future.

### Key Decision
**Move the fix one layer up: from a per-`USelect`-instance `:ui` prop to the global `ui` option of the `ui()` Vite plugin call.** This is preferred over the current duplication because:
- It matches the project's existing precedent of using `vite.config.js` for app-wide Nuxt UI configuration (`colorMode: false` already lives there for the exact same "one decision, applies everywhere" reason).
- It removes duplication (the same `{ content: 'font-mono' }` object was already repeated on both `USelect`s in `CritTacOps.vue`) and eliminates the risk of a future `USelect` elsewhere in the app forgetting the override.
- Nuxt UI's own precedence rules (global config → resolved variants → `ui` prop → `class` prop) are unaffected: a specific instance could still opt out or customize further with its own `:ui` prop later, without needing to touch the global default.

### Proposed Changes
- **`vite.config.js`** — extend the existing `ui({ colorMode: false })` call with a `ui` option targeting the `select` component's `content` slot:
```js
ui({
    colorMode: false,
    // Il pannello a tendina di USelect viene teleportato fuori da
    // .app-wrapper (che in App.vue imposta font-family: var(--font-mono)
    // per tutta l'app), quindi per default le opzioni userebbero il font
    // di fallback di <body> invece del monospace usato ovunque nell'UI.
    // Impostarlo qui, invece che per singola istanza, lo applica a ogni
    // USelect dell'app, presente e futura.
    ui: {
        select: {
            slots: {
                content: 'font-mono',
            },
        },
    },
})
```
- **`src/views/CritTacOps.vue`** — remove the now-redundant local override: delete the `const selectDropdownUi = { content: 'font-mono' }` declaration, its explanatory comment, and both `:ui="selectDropdownUi"` bindings on the two `USelect` elements (the components keep their other props — `v-model`, `multiple`, `:items`, `placeholder`, `class` — unchanged).

### Data Models / Contracts
No store, prop, or component API changes. `USelect`'s public behavior is unaffected; this only changes which layer supplies the `content` slot's class.

### Components
- `vite.config.js` — gains the global `select` theme override, colocated with the existing `colorMode: false` Nuxt UI setting.
- `src/views/CritTacOps.vue` — loses the local `selectDropdownUi` object and its two usages; the two `USelect` filter dropdowns render identically, now driven by the global config.

### File Structure
```
vite.config.js               (modified: add global `ui.select.slots.content` override)
src/
  views/
    CritTacOps.vue            (modified: remove local selectDropdownUi + :ui bindings)
```

### Risks
- **Scope of the override**: setting `select.slots.content` globally affects *every* `USelect` in the app, not just the two in `CritTacOps.vue`. Today that's the only place `USelect` is used, so there is no behavior change to verify elsewhere, but this is worth knowing before adding a new `USelect` with a different font requirement in the future (it would need its own `:ui` prop to opt out, which Nuxt UI's precedence rules already support).
- **`colorMode: false` interaction**: the `ui` option is merged independently of `colorMode` in `unplugin.mjs` (`defu({ ui: options.ui, colorMode: options.colorMode }, ...)`), so disabling color mode does not affect whether the `select` override applies — no interaction risk.
- **Build-time only**: like the existing `colorMode` setting, this override takes effect at Vite plugin configuration time, so a dev-server restart (not just HMR) is needed to see it reflected after editing `vite.config.js` — consistent with how the earlier `colorMode: false` change was validated in this project.

# Testing

### Validation Approach
No automated test runner exists in this project; validation is manual via a restarted dev server (`npm run dev`) plus a final `npm run build` sanity check, consistent with how this area was previously validated.

### Key Scenarios
- After adding the global override and removing the local one, restart `npm run dev` (config-level plugin change, not HMR-safe) and open `/ops`.
- Open both the "Crit Ops" and "Tac Ops" filter dropdowns: confirm the option list still renders in `"JetBrains Mono", monospace`, matching the trigger button's font, exactly as before the change.
- Confirm no other visual regression on the dropdowns (colors, radius, spacing) — only the font-source mechanism changed, not any styling values.
- Confirm the rest of the app (Rules carousel, Crit/Tac Ops carousel, header, nav) is visually unaffected, since the change is scoped to the `select` component's `content` slot only.

### Edge Cases
- Confirm `npm run build` completes with no errors/warnings after both the `vite.config.js` and `CritTacOps.vue` changes.
- Confirm no leftover reference to `selectDropdownUi` remains in `CritTacOps.vue` (unused-variable/import) after removal.
- If a future `USelect` is added elsewhere without any `:ui` prop, confirm (by code review, since no such usage exists yet) it would also render `content` in `font-mono`, per the global override's app-wide scope.

# Delivery Steps

### ✓ Step 1: Add the global Select theme override to vite.config.js
All `USelect` popups app-wide render their options in `font-mono`, driven by a single override in `vite.config.js` instead of a per-instance prop.
- In `vite.config.js`, extend the existing `ui({ colorMode: false })` call with a `ui: { select: { slots: { content: 'font-mono' } } }` option.
- Add a short Italian comment above it (matching the codebase's comment style) explaining why: `USelect`'s popup content is teleported outside `.app-wrapper` (which sets `font-family: var(--font-mono)` for the whole app in `App.vue`), so without this override the options would fall back to `body`'s font instead.
- Restart the dev server (`npm run dev`) — a Vite plugin config change, not something HMR picks up — and confirm no console/startup errors.

### ✓ Step 2: Remove the now-redundant per-component override and verify equivalence
CritTacOps.vue's two filter dropdowns keep exactly the same visual behavior with less duplicated code, now sourced from the global config.
- In `src/views/CritTacOps.vue`, delete the local `const selectDropdownUi = { content: 'font-mono' }` declaration and its explanatory comment, and remove the `:ui="selectDropdownUi"` binding from both `USelect` elements (all other props stay unchanged).
- Manually verify in the restarted `npm run dev` session that both the "Crit Ops" and "Tac Ops" dropdown option lists still render in `"JetBrains Mono", monospace`, matching the trigger and the rest of the UI — confirming the global config produces the identical runtime result as the removed per-instance prop.
- Run `npm run build` to confirm the full app still builds cleanly with no errors/warnings and no unused-variable references left behind.