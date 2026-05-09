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
  <header>
    <div class="dialog-title">
      <span class="dialog-accent" aria-hidden="true"></span>
      <h2>Pick an icon</h2>
    </div>
    <button class="close-btn" aria-label="Close" onclick={onclose}>✕</button>
  </header>

  <div class="picker-body">
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
  </div>
</dialog>

<style>
  dialog {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0;
    width: min(700px, 96vw);
    max-height: 86vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.65);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    background: var(--title-bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .dialog-accent {
    display: block;
    width: 3px;
    height: 1.2rem;
    background: var(--accent);
    border-radius: 1px;
    flex-shrink: 0;
  }

  h2 {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text);
  }

  .close-btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 2px;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--text-muted);
    padding: 0.2rem 0.4rem;
    line-height: 1;
  }

  .close-btn:hover {
    background: var(--hover);
    border-color: var(--border);
    color: var(--text);
  }

  .picker-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-y: auto;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .cat-label {
    margin: 0;
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  .icon-cell {
    width: 44px;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 1px solid transparent;
    border-radius: 2px;
    background: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.06s, border-color 0.06s;
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
    font-size: 2rem;
    color: var(--text);
    line-height: 1;
  }

  .num {
    font-size: 0.5rem;
    color: var(--text-muted);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .icon-cell.selected .glyph,
  .icon-cell.selected .num {
    color: #fff;
  }
</style>
