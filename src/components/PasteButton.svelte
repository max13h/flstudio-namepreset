<script lang="ts">
  import { presetsState } from '../state/presets.svelte';
</script>

<div class="paste-area">
  <button class="btn-primary paste-btn" onclick={() => presetsState.paste()}>
    Paste NamePreset content
  </button>
  {#if presetsState.error}
    <span class="error-msg" role="alert">{presetsState.error}</span>
  {/if}
</div>

<style>
  .paste-area {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .paste-btn {
    font-size: 0.95rem;
    padding: 0.6rem 1.25rem;
  }

  .error-msg {
    color: var(--danger);
    font-size: 0.85rem;
  }
</style>
