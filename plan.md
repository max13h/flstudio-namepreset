# FL Studio NamePreset Web Editor — Implementation Plan

## Context

FL Studio stores quick-rename presets in plain `.txt` files (one per element type: Channel, MixerSlot, etc.). Each line is `Name,$HEXCOLOR,IconNumber`. There's no official GUI for editing these on non-Windows systems, and the existing Windows-only tool (FLS NamePresetEditor) is complex to set up. This app is a lightweight browser-based editor: paste → edit → copy.

---

## Color Format

After analysis the `$` is a **Delphi hex prefix** (not decimal). Colors are **BGR hex** (Windows COLORREF), max 6 hex digits, padded with leading zeros on output.

- **Parse:** `parseInt(str.replace('$', ''), 16)` → extract bytes: `R = v & 0xFF`, `G = (v >> 8) & 0xFF`, `B = (v >> 16) & 0xFF`
- **Display:** convert to `#RRGGBB` for `<input type="color">`
- **Serialize:** `R | (G << 8) | (B << 16)` → `$` + uppercase hex, padded to 6 digits

The few 7-digit values in the wild (e.g. `$5926555`) have an extra high byte that FL Studio ignores; parsing as a hex integer handles them correctly.

---

## File Format

```
Name,$BBGGRR,IconNumber      ← normal preset row
CategoryName,,               ← category row (section divider, shown highlighted in FL Studio)
```

- Icon numbers: `0–255` (single byte; FL Studio clamps larger values to a byte)
- A category row has no color and no icon; it acts as a visual section header in FL Studio's quick-rename menu

---

## Architecture

Svelte 5 + TypeScript + Vite. **No UI library.** CSS written by hand. One page, no router.

### Data model (`src/lib/types.ts`)
```ts
interface Preset {
  name: string;
  color: number;     // BGR integer
  icon: number;      // 0–255
  isCategory: boolean;
}
```

### Files to create / rewrite

| File | Purpose |
|---|---|
| `src/App.svelte` | Full rewrite — page layout, state, paste/copy |
| `src/app.css` | Full rewrite — hand-crafted CSS |
| `src/lib/types.ts` | `Preset` interface |
| `src/lib/parser.ts` | `parse(text): Preset[]` and `serialize(presets): string` |
| `src/lib/color.ts` | `bgrToHex(n)`, `hexToBgr(hex)` helpers |
| `src/lib/PresetLine.svelte` | One editable row |
| `src/lib/IconPicker.svelte` | Modal: reference image + number input |
| `src/lib/ConfirmDialog.svelte` | Reusable "are you sure?" dialog |
| `public/icons-reference.png` | **User provides** — the FL Studio icon chart image |
| `playwright.config.ts` | Playwright E2E config |
| `tests/preset.spec.ts` | E2E test suite |

Files to **delete** (default template content):
`src/lib/Counter.svelte`, `src/assets/hero.png`, `src/assets/svelte.svg`, `src/assets/vite.svg`

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  FL Studio Preset Editor                            │
│                                                     │
│  [ Paste NamePreset content ]                       │
│                                                     │
│  ┌─ # ──── Name ─────── Color ── Icon ─── Del ────┐ │
│  │  1 [__________] [  ██  ] [ 4 ]  [ × ]          │ │
│  │  2 [__________] [  ██  ] [ 7 ]  [ × ]  [cat]   │ │
│  │  …                                              │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  [ + Add line ]                    [ Copy output ] │
└─────────────────────────────────────────────────────┘
```

**Per-row controls (`PresetLine.svelte`):**
- `[Cat]` toggle: marks row as category (disables color + icon inputs, grays out row)
- Name `<input type="text">`
- Color `<input type="color">` (hidden native picker, show colored swatch)
- Icon button: shows `[<number>]`, clicking opens `IconPicker` modal
- Delete `[×]` button: opens `ConfirmDialog` before removal

**Icon Picker modal (`IconPicker.svelte`):**
- Shows `public/icons-reference.png` (the FL Studio icon chart the user will place there)
- Number input `0–255` to type/confirm the icon number
- "Select" button closes modal and applies the number
- `Escape` or backdrop click dismisses without change

**Paste button:**
- Reads clipboard via `navigator.clipboard.readText()`
- Validates: at least one valid line matching `name,$hex,number` or category format
- On failure: shows inline error message
- On success: replaces the current list

**Copy button:**
- Serializes current presets to text
- Writes to clipboard via `navigator.clipboard.writeText()`
- Shows brief "Copied!" feedback

---

## Key Implementation Details

### `src/lib/parser.ts`
```ts
// Parse one line:
// "Name,$HEXCOLOR,IconNum"  → normal Preset
// "CategoryName,,"          → category Preset
// ""                        → skip
function parseLine(line: string): Preset | null
function parse(text: string): Preset[]
function serialize(presets: Preset[]): string
```

### `src/lib/color.ts`
```ts
function bgrToHex(bgr: number): string  // → "#RRGGBB"
function hexToBgr(hex: string): number  // "#RRGGBB" → BGR int
```

### State in `App.svelte` (Svelte 5 runes)
```ts
let presets: Preset[] = $state([]);
let error: string = $state('');
let copied: boolean = $state(false);
```

---

## Playwright E2E Tests (`tests/preset.spec.ts`)

1. **Parse valid content** — mock clipboard with a sample preset text, click Paste, verify rows appear with correct names, colors, icons
2. **Reject invalid content** — paste garbage text, verify error message appears
3. **Add a row** — click `+`, verify a blank row is appended
4. **Delete with confirmation** — click `×`, verify dialog appears; cancel → row stays; confirm → row gone
5. **Toggle category** — click Cat toggle, verify color/icon inputs become disabled
6. **Color change** — change `<input type="color">`, verify the serialized output has the correct `$HEXCOLOR`
7. **Icon picker** — click icon button, modal opens; type a number; click Select; verify icon number updated on row
8. **Copy output** — verify clicking Copy produces correctly formatted text (use `page.evaluate` to intercept clipboard)

---

## Setup Steps (for implementation)

1. Install Playwright: `pnpm add -D @playwright/test` + `npx playwright install chromium`
2. Add `"test:e2e": "playwright test"` script to `package.json`
3. Place user-provided icon chart at `public/icons-reference.png`
4. Delete default template files listed above
5. Implement in order: `types.ts` → `parser.ts` → `color.ts` → `App.svelte` + `app.css` → `PresetLine.svelte` → `IconPicker.svelte` → `ConfirmDialog.svelte` → tests

---

## Verification

1. `pnpm dev` → open browser → paste the sample from the brief → all 30 rows render with correct names
2. Change a color → click Copy → paste into a text editor → verify `$HEXCOLOR` round-trips correctly
3. Add, delete rows with confirmation
4. Mark a row as category → verify it serializes as `Name,,`
5. Open icon picker → type `86` → close → verify icon button shows `86`
6. `pnpm test:e2e` → all 8 tests pass
