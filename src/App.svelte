<script lang="ts">
  import { presetsState } from './state/presets.svelte';
  import PasteButton from './components/PasteButton.svelte';
  import PresetLine from './components/PresetLine.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
</script>

<main>
  <header>
    <div>
      <h1>NamePreset Editor for FL Studio</h1>
      <p class="subtitle">Paste your NamePreset file content, edit, then copy it back.</p>
    </div>
    <ThemeToggle />
  </header>

  <div class="toolbar top">
    <PasteButton />
  </div>

  {#if presetsState.presets.length > 0}
    <div class="list-header" aria-hidden="true">
      <span></span>
      <span class="col-index">#</span>
      <span class="col-cat">Cat</span>
      <span class="col-name">Name</span>
      <span class="col-color">Color</span>
      <span class="col-icon">Icon</span>
      <span class="col-del"></span>
    </div>

    <div class="preset-list" role="list">
      {#each presetsState.presets as preset, i (i)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="drag-wrapper"
          class:is-dragging={presetsState.draggingIndex === i}
          class:drag-over-before={presetsState.dragOverIndex === i && presetsState.draggingIndex !== i && presetsState.dragOverPosition === 'before'}
          class:drag-over-after={presetsState.dragOverIndex === i && presetsState.draggingIndex !== i && presetsState.dragOverPosition === 'after'}
          role="listitem"
          ondragstart={(e) => presetsState.dragStart(i, e)}
          ondragover={(e) => presetsState.dragOver(i, e)}
          ondrop={(e) => presetsState.drop(i, e)}
          ondragend={() => presetsState.dragEnd()}
        >
          <PresetLine
            {preset}
            index={i}
            onchange={(updated) => presetsState.updatePreset(i, updated)}
            ondelete={() => presetsState.deletePreset(i)}
          />
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>No presets loaded. Paste a NamePreset file to get started.</p>
    </div>
  {/if}

  <div class="toolbar bottom">
    <button class="btn-secondary add-btn" onclick={() => presetsState.addLine()}>+ Add line</button>
    {#if presetsState.presets.length > 0}
      <button class="btn-primary copy-btn" onclick={() => presetsState.copy()}>
        {presetsState.copied ? 'Copied!' : 'Copy output'}
      </button>
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  h1 {
    margin: 0 0 0.4rem;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--text);
  }

  .subtitle {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .toolbar.bottom {
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  .copy-btn {
    font-size: 0.95rem;
    padding: 0.6rem 1.25rem;
    min-width: 130px;
    transition: background 0.15s;
  }

  .list-header {
    display: grid;
    grid-template-columns: 1.5rem 2rem 3rem 1fr 2.5rem 3.5rem 2.5rem;
    gap: 0.5rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .col-index { text-align: right; }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .drag-wrapper {
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: 4px;
    transition: border-color 0.05s, opacity 0.08s;
  }

  .drag-wrapper.is-dragging {
    opacity: 0.35;
  }

  .drag-wrapper.drag-over-before {
    border-top-color: var(--accent);
  }

  .drag-wrapper.drag-over-after {
    border-bottom-color: var(--accent);
  }

  .empty-state {
    border: 1px dashed var(--border);
    border-radius: 6px;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-muted);
  }

  .empty-state p {
    margin: 0;
  }

  .add-btn {
    font-size: 0.95rem;
    padding: 0.6rem 1.25rem;
  }
</style>
