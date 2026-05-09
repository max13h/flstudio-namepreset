<script lang="ts">
  import QuickStartDialog from './QuickStartDialog.svelte';

  let dialogOpen = $state(false);
</script>

<button class="btn-primary quick-start-btn" onclick={() => (dialogOpen = true)}>
  Quick Start
</button>

{#if dialogOpen}
  <QuickStartDialog onclose={() => (dialogOpen = false)} />
{/if}

<style>
  .quick-start-btn {
    font-size: 0.95rem;
    padding: 0.6rem 1.25rem;
  }
</style>
