<script lang="ts">
  import { presetsState } from './state/presets.svelte';
  import QuickStartButton from './components/QuickStartButton.svelte';
  import ResetButton from './components/ResetButton.svelte';
  import PresetLine from './components/PresetLine.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
</script>

<div class="fl-window">
  <!-- Title bar -->
  <header class="title-bar">
    <div class="title-left">
      <span class="accent-mark" aria-hidden="true"></span>
      <div class="title-text">
        <h1>NamePreset Editor</h1>
        <span class="title-sub">for FL Studio</span>
      </div>
    </div>
    <ThemeToggle />
  </header>

  <!-- Toolbar -->
  <div class="toolbar">
    <QuickStartButton />
    <ResetButton />
  </div>

  <!-- Content -->
  <div class="content">
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
              isLastEdited={presetsState.lastEditedIndex === i}
              onchange={(updated) => presetsState.updatePreset(i, updated)}
              ondelete={() => presetsState.deletePreset(i)}
            />
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <p class="empty-title">No presets loaded</p>
        <p class="empty-hint">Use Quick Start to paste a NamePreset file or load an FL Studio default.</p>
      </div>
    {/if}
  </div>

  <!-- Status bar / bottom toolbar -->
  <footer class="status-bar">
    <button class="btn-secondary add-btn" onclick={() => presetsState.addLine()}>+ Add line</button>
    <div class="status-right">
      {#if presetsState.presets.length > 0}
        <span class="preset-count">{presetsState.presets.length} preset{presetsState.presets.length !== 1 ? 's' : ''}</span>
        <button class="btn-primary copy-btn" onclick={() => presetsState.copy()}>
          {presetsState.copied ? '✓ Copied' : 'Copy output'}
        </button>
      {/if}
    </div>
  </footer>
</div>

<style>
  .fl-window {
    max-width: 900px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  /* ── Title bar ──────────────────────────────────────────────────────────── */
  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.9rem;
    background: var(--title-bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .title-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  /* Orange vertical accent mark — FL Studio's signature left bar */
  .accent-mark {
    display: block;
    width: 3px;
    height: 2.6rem;
    background: var(--accent);
    border-radius: 1px;
    flex-shrink: 0;
  }

  .title-text h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .title-sub {
    display: block;
    font-size: 0.68rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  /* ── Toolbar ────────────────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: var(--toolbar-bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  /* ── Content ────────────────────────────────────────────────────────────── */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
    min-height: 200px;
  }

  .list-header {
    display: grid;
    grid-template-columns: 1.5rem 2rem 3rem 1fr 2.5rem 3.5rem 2.5rem;
    gap: 0.4rem;
    padding: 0.25rem 0.75rem;
    padding-left: calc(0.75rem + 3px); /* align with row content past the color indicator */
    font-size: 0.68rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.2rem;
  }

  .col-index { text-align: right; }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0 0 0.25rem;
  }

  .drag-wrapper {
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;
    transition: border-color 0.05s, opacity 0.08s;
  }

  .drag-wrapper.is-dragging {
    opacity: 0.3;
  }

  .drag-wrapper.drag-over-before {
    border-top-color: var(--accent);
  }

  .drag-wrapper.drag-over-after {
    border-bottom-color: var(--accent);
  }

  /* ── Empty state ────────────────────────────────────────────────────────── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 2rem;
    gap: 0.4rem;
    color: var(--text-muted);
    text-align: center;
  }

  .empty-title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .empty-hint {
    margin: 0;
    font-size: 0.78rem;
    color: var(--text-muted);
    opacity: 0.7;
    max-width: 320px;
  }

  /* ── Status bar / bottom toolbar ────────────────────────────────────────── */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    background: var(--toolbar-bg);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .preset-count {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .add-btn,
  .copy-btn {
    font-size: 0.86rem;
    padding: 0.38rem 0.9rem;
  }

  .copy-btn {
    min-width: 110px;
    text-align: center;
  }
</style>
