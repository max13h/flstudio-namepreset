<script lang="ts">
  import QuickStartDialog from './QuickStartDialog.svelte';

  let dialogOpen = $state(false);
</script>

<button class="btn-primary" onclick={() => (dialogOpen = true)}>
  Quick Start
</button>

{#if dialogOpen}
  <QuickStartDialog onclose={() => (dialogOpen = false)} />
{/if}
