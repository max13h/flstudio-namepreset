<script lang="ts">
  import { bgrToHex, hexToBgr } from '../utils/color';
  import { iconToChar } from '../utils/icons';
  import IconPicker from './IconPicker.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
    import type { Preset } from '../types';

  interface Props {
    preset: Preset;
    index: number;
    onchange: (updated: Preset) => void;
    ondelete: () => void;
  }

  let { preset, index, onchange, ondelete }: Props = $props();

  let showIconPicker = $state(false);
  let showConfirm = $state(false);

  function update(fields: Partial<Preset>) {
    onchange({ ...preset, ...fields });
  }
</script>

<div class="row" class:category={preset.isCategory} data-testid="preset-row">
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
    placeholder="Name"
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
    display: grid;
    grid-template-columns: 1.5rem 2rem 3rem 1fr 2.5rem 3.5rem 2.5rem;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    background: var(--row-bg);
    border: 1px solid transparent;
    transition: border-color 0.1s;
  }

  .row:hover {
    border-color: var(--border);
  }

  .row.category {
    background: var(--category-bg);
  }

  .drag-handle {
    color: var(--text-muted);
    font-size: 1rem;
    opacity: 0.4;
    user-select: none;
    line-height: 1;
  }

  .row:hover .drag-handle {
    opacity: 0.8;
  }

  .index {
    color: var(--text-muted);
    font-size: 0.8rem;
    text-align: right;
    user-select: none;
  }

  .cat-toggle {
    font-size: 0.7rem;
    padding: 0.2rem 0.3rem;
    border-radius: 3px;
    border: 1px solid var(--border);
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
  }

  .cat-toggle.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .name-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.3rem 0.5rem;
    color: var(--text);
    font-size: 0.9rem;
    cursor: text;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .color-label {
    position: relative;
    display: flex;
    cursor: pointer;
  }

  .color-swatch {
    width: 2rem;
    height: 1.75rem;
    border-radius: 4px;
    border: 1px solid var(--border);
    display: block;
  }

  .color-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .row.category .color-swatch {
    opacity: 0.2;
    pointer-events: none;
  }

  .icon-btn {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.3rem 0.4rem;
    color: var(--text);
    font-size: 0.85rem;
    cursor: pointer;
    min-width: 3rem;
    text-align: center;
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .delete-btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.3rem 0.5rem;
  }

  .delete-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
  }
</style>
