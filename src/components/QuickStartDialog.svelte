<script lang="ts">
  import { onMount } from 'svelte';
  import { parse, isValidPresetText } from '../utils/parser';
  import { presetsState } from '../state/presets.svelte';
  import { DEFAULT_PRESET_LISTS, type DefaultPresetList } from '../data/defaultPresets';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import type { Preset } from '../types';

  interface Props {
    onclose: () => void;
  }
  let { onclose }: Props = $props();

  let dialogEl: HTMLDialogElement;
  let pasteError = $state('');
  let isPasting = $state(false);

  let pendingPresets: Preset[] | null = $state(null);
  let pendingLabel = $state('');

  onMount(() => dialogEl.showModal());

  // Loads immediately when there are no existing presets; otherwise holds
  // them as pending and waits for the user to confirm overwrite.
  function requestLoad(presets: Preset[], label: string) {
    if (presetsState.presets.length === 0) {
      presetsState.load(presets);
      onclose();
    } else {
      pendingPresets = presets;
      pendingLabel = label;
    }
  }

  function confirmOverwrite() {
    presetsState.load(pendingPresets!);
    pendingPresets = null;
    onclose();
  }

  function cancelOverwrite() {
    pendingPresets = null;
  }

  async function handlePaste() {
    pasteError = '';
    isPasting = true;
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      pasteError = 'Could not read clipboard. Make sure the page has clipboard permission.';
      isPasting = false;
      return;
    }
    isPasting = false;
    if (!isValidPresetText(text)) {
      pasteError = 'Clipboard content does not look like a valid NamePreset file.';
      return;
    }
    requestLoad(parse(text), 'clipboard content');
  }

  function handleDefault(list: DefaultPresetList) {
    requestLoad(list.presets, list.label);
  }
</script>

<dialog
  bind:this={dialogEl}
  aria-label="Quick Start"
  aria-modal="true"
  onclose={onclose}
  onclick={(e) => { if (e.target === dialogEl) onclose(); }}
>
  <header>
    <h2>Quick Start</h2>
    <button class="close-btn" aria-label="Close" onclick={onclose}>✕</button>
  </header>

  <section class="paste-section">
    <h3>From clipboard</h3>
    <p class="section-hint">Paste a NamePreset file you previously copied from FL Studio.</p>
    <button class="btn-primary paste-btn" onclick={handlePaste} disabled={isPasting}>
      {isPasting ? 'Reading clipboard…' : 'Paste NamePreset content'}
    </button>
    {#if pasteError}
      <p class="error-msg" role="alert">{pasteError}</p>
    {/if}
  </section>

  <div class="divider" aria-hidden="true">
    <span>or start from an FL Studio default</span>
  </div>

  <section class="defaults-section">
    <h3 class="sr-only">FL Studio defaults</h3>
    <ul class="defaults-grid" role="list">
      {#each DEFAULT_PRESET_LISTS as list}
        <li>
          <button class="default-card btn-secondary" onclick={() => handleDefault(list)}>
            <span class="card-label">{list.label}</span>
            <span class="card-desc">{list.description}</span>
            <span class="card-count">{list.presets.length} presets</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <footer>
    <button class="btn-secondary" onclick={onclose}>Cancel</button>
  </footer>
</dialog>

{#if pendingPresets}
  <ConfirmDialog
    message="This will replace your {presetsState.presets.length} current preset(s) with the {pendingLabel} defaults."
    confirmLabel="Replace"
    confirmClass="btn-primary"
    onconfirm={confirmOverwrite}
    oncancel={cancelOverwrite}
  />
{/if}

<style>
  dialog {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0;
    width: min(560px, 92vw);
    max-height: 90vh;
    overflow-y: auto;
    color: var(--text);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem 0;
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
  }

  h3 {
    margin: 0 0 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    padding: 0.25rem 0.4rem;
    border-radius: 4px;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--text);
    background: var(--hover);
  }

  .paste-section,
  .defaults-section {
    padding: 1.25rem 1.5rem;
  }

  .section-hint {
    margin: 0 0 0.85rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .paste-btn {
    font-size: 0.9rem;
    padding: 0.55rem 1.1rem;
  }

  .error-msg {
    margin: 0.6rem 0 0;
    font-size: 0.85rem;
    color: var(--danger);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .defaults-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .default-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding: 0.7rem 0.9rem;
    text-align: left;
  }

  .card-label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .card-desc {
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .card-count {
    font-size: 0.75rem;
    color: var(--accent);
    margin-top: 0.1rem;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem 1.25rem;
    border-top: 1px solid var(--border);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
