<script lang="ts">
  import { bgrToHex, hexToBgr } from '../utils/color';
  import { iconToChar } from '../utils/icons';
  import IconPicker from './IconPicker.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import type { Preset } from '../types';

  interface Props {
    preset: Preset;
    index: number;
    isLastEdited: boolean;
    onchange: (updated: Preset) => void;
    ondelete: () => void;
  }

  let { preset, index, isLastEdited, onchange, ondelete }: Props = $props();

  let showIconPicker = $state(false);
  let showConfirm = $state(false);

  function update(fields: Partial<Preset>) {
    onchange({ ...preset, ...fields });
  }

  let rowColor = $derived(preset.isCategory ? '' : bgrToHex(preset.color));
</script>

<!--
  --channel-color drives the left accent strip on each row, mirroring how
  FL Studio's Channel Rack shows each channel's assigned color on the left edge.
-->
<div
  class="row"
  class:category={preset.isCategory}
  class:last-edited={isLastEdited}
  style={rowColor ? `--channel-color: ${rowColor}` : ''}
  data-testid="preset-row"
>
  <span class="drag-handle" draggable="true" aria-hidden="true" data-testid="drag-handle">⠿</span>

  <span class="index">{index + 1}</span>

  <button
    class="cat-toggle"
    class:active={preset.isCategory}
    aria-pressed={preset.isCategory}
    aria-label="Toggle category"
    onclick={() => update({ isCategory: !preset.isCategory })}
  >Cat</button>

  <input
    class="name-input"
    type="text"
    value={preset.name}
    placeholder="Name…"
    aria-label="Preset name"
    oninput={(e) => update({ name: (e.target as HTMLInputElement).value })}
  />

  <label class="color-label" title="Pick color">
    <span class="color-swatch" style="background:{bgrToHex(preset.color)}"></span>
    <input
      class="color-input"
      type="color"
      value={bgrToHex(preset.color)}
      disabled={preset.isCategory}
      aria-label="Preset color"
      oninput={(e) => update({ color: hexToBgr((e.target as HTMLInputElement).value) })}
    />
  </label>

  <button
    class="icon-btn"
    disabled={preset.isCategory}
    aria-label={`Icon ${preset.icon}`}
    onclick={() => (showIconPicker = true)}
  ><span style="font-family:'ILGlyphs'">{iconToChar(preset.icon)}</span></button>

  <button
    class="delete-btn"
    aria-label="Delete preset"
    onclick={() => (showConfirm = true)}
  >✕</button>
</div>

{#if showIconPicker}
  <IconPicker
    current={preset.icon}
    onselect={(n) => { update({ icon: n }); showIconPicker = false; }}
    onclose={() => (showIconPicker = false)}
  />
{/if}

{#if showConfirm}
  <ConfirmDialog
    message="Delete this preset?"
    onconfirm={() => { showConfirm = false; ondelete(); }}
    oncancel={() => (showConfirm = false)}
  />
{/if}

<style>
  .row {
    position: relative;
    display: grid;
    grid-template-columns: 1.5rem 2rem 3rem 1fr 2.5rem 3.5rem 2.5rem;
    align-items: center;
    gap: 0.4rem;
    padding: 0.28rem 0.75rem;
    background: var(--row-bg);
    border: none;
    border-radius: 0;
    transition: background 0.06s;
  }

  /* Colored left channel strip — uses the preset's own color */
  .row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 30px;
    background: var(--channel-color, var(--border));
  }

  /* Category rows use the accent color for their strip */
  .row.category::before {
    background: var(--accent);
  }

  /* Right-side indicator: appears when the row has been edited since the last load */
  .row::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 0.5rem;
    background: transparent;
    transition: background 0.15s;
  }

  .row.last-edited::after {
    background: var(--accent);
  }

  .row:hover {
    background: var(--hover);
  }

  .row.category {
    background: var(--category-bg);
  }

  .row.category:hover {
    background: color-mix(in srgb, var(--category-bg) 80%, var(--hover));
  }

  .drag-handle {
    color: var(--text-muted);
    font-size: 1rem;
    opacity: 0.3;
    user-select: none;
    line-height: 1;
    cursor: grab;
  }

  .row:hover .drag-handle {
    opacity: 0.7;
  }

  .index {
    color: var(--text-muted);
    font-size: 0.72rem;
    text-align: right;
    user-select: none;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  .cat-toggle {
    font-size: 0.66rem;
    padding: 0.18rem 0.3rem;
    border-radius: 2px;
    border: 1px solid var(--border);
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cat-toggle.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .name-input {
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 0.22rem 0.4rem;
    color: var(--text);
    font-size: 0.86rem;
    cursor: text;
    transition: border-color 0.08s, background 0.08s;
  }

  .name-input:hover {
    border-color: var(--border);
    background: var(--input-bg);
  }

  .name-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--input-bg);
  }

  .name-input::placeholder {
    color: var(--text-muted);
    opacity: 0.5;
  }

  .color-label {
    position: relative;
    display: flex;
    cursor: pointer;
  }

  .color-swatch {
    width: 2rem;
    height: 1.5rem;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.35);
    display: block;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
  }

  .color-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .row.category .color-swatch {
    opacity: 0.15;
    pointer-events: none;
  }

  .icon-btn {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.22rem 0.3rem;
    color: var(--text);
    font-size: 0.9rem;
    cursor: pointer;
    min-width: 3rem;
    text-align: center;
    transition: border-color 0.08s;
  }

  .icon-btn:hover:not(:disabled) {
    border-color: var(--accent);
  }

  .icon-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .delete-btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 2px;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.78rem;
    padding: 0.22rem 0.4rem;
    opacity: 0;
    transition: opacity 0.08s, color 0.08s;
  }

  .row:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(184, 56, 56, 0.12);
  }
</style>
