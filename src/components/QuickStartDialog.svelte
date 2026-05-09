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
    <div class="dialog-title">
      <span class="dialog-accent" aria-hidden="true"></span>
      <h2>Quick Start</h2>
    </div>
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
          <button class="default-card" onclick={() => handleDefault(list)}>
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
    border-radius: 3px;
    padding: 0;
    width: min(540px, 93vw);
    max-height: 90vh;
    overflow-y: auto;
    color: var(--text);
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
  }

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  /* Mirrors the app title bar's orange accent mark */
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
  }

  h3 {
    margin: 0 0 0.35rem;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }

  .close-btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 2px;
    color: var(--text-muted);
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--text);
    border-color: var(--border);
    background: var(--hover);
  }

  .paste-section,
  .defaults-section {
    padding: 1rem 1.1rem;
  }

  .section-hint {
    margin: 0 0 0.7rem;
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.45;
  }

  .paste-btn {
    font-size: 0.86rem;
    padding: 0.42rem 1rem;
  }

  .error-msg {
    margin: 0.55rem 0 0;
    font-size: 0.8rem;
    color: var(--danger);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0 1.1rem;
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
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
    gap: 0.4rem;
  }

  .default-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    padding: 0.55rem 0.75rem;
    text-align: left;
    background: var(--btn-bg);
    border-style: solid;
    border-width: 1px;
    border-color: var(--btn-border-t) var(--border) var(--btn-border-b) var(--border);
    border-radius: 2px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.08s, border-color 0.08s;
  }

  .default-card:hover {
    background: var(--hover);
    border-color: var(--accent);
  }

  .card-label {
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .card-desc {
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .card-count {
    font-size: 0.68rem;
    color: var(--accent);
    margin-top: 0.1rem;
    font-weight: 600;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    padding: 0.65rem 1.1rem;
    border-top: 1px solid var(--border);
    background: var(--toolbar-bg);
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
