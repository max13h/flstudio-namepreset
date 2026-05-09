<script lang="ts">
  import { presetsState } from '../state/presets.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';

  let confirmOpen = $state(false);

  function confirmReset() {
    presetsState.load([]);
    confirmOpen = false;
  }
</script>

<button
  class="btn-secondary"
  disabled={presetsState.presets.length === 0}
  onclick={() => (confirmOpen = true)}
>
  Reset
</button>

{#if confirmOpen}
  <ConfirmDialog
    message="This will clear all {presetsState.presets.length} preset(s). This cannot be undone."
    confirmLabel="Reset"
    confirmClass="btn-danger"
    onconfirm={confirmReset}
    oncancel={() => (confirmOpen = false)}
  />
{/if}
