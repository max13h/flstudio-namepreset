<script lang="ts">
  import { onMount } from 'svelte';
  import { CATEGORIES, iconToChar } from '../utils/icons';

  interface Props {
    current: number;
    onselect: (icon: number) => void;
    onclose: () => void;
  }

  let { current, onselect, onclose }: Props = $props();

  let dialogEl: HTMLDialogElement;

  onMount(() => dialogEl.showModal());
</script>

<dialog
  bind:this={dialogEl}
  aria-modal="true"
  aria-label="Icon picker"
  tabindex="-1"
  onclose={onclose}
  onclick={(e) => { if (e.target === dialogEl) onclose(); }}
>
  <div class="modal-header">
    <h2>Pick an icon</h2>
    <button class="close-btn" aria-label="Close" onclick={onclose}>✕</button>
  </div>

  {#each CATEGORIES as cat}
    <section class="category">
      <h3 class="cat-label">{cat.label}</h3>
      <div class="icon-grid">
        {#each cat.icons as n}
          <button
            class="icon-cell"
            class:selected={current === n}
            aria-label={`Icon ${n}`}
            aria-pressed={current === n}
            onclick={() => onselect(n)}
          >
            <span class="glyph">{iconToChar(n)}</span>
            <span class="num">{n}</span>
          </button>
        {/each}
      </div>
    </section>
  {/each}
</dialog>

<style>
  dialog {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    width: min(700px, 95vw);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-height: 85vh;
    overflow-y: auto;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.55);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-muted);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .close-btn:hover {
    background: var(--hover);
    color: var(--text);
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .cat-label {
    margin: 0;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .icon-cell {
    width: 46px;
    height: 46px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .icon-cell:hover {
    background: var(--hover);
    border-color: var(--border);
  }

  .icon-cell.selected {
    background: var(--accent);
    border-color: var(--accent);
  }

  .glyph {
    font-family: 'ILGlyphs';
    font-size: 1.3rem;
    color: var(--text);
    line-height: 1;
  }

  .num {
    font-size: 0.55rem;
    color: var(--text-muted);
    line-height: 1;
  }

  .icon-cell.selected .glyph,
  .icon-cell.selected .num {
    color: #fff;
  }
</style>
