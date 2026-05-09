<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    message: string;
    confirmLabel?: string;
    confirmClass?: string;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let { message, confirmLabel = 'Delete', confirmClass = 'btn-danger', onconfirm, oncancel }: Props = $props();

  let dialogEl: HTMLDialogElement;

  onMount(() => dialogEl.showModal());
</script>

<dialog
  bind:this={dialogEl}
  role="alertdialog"
  aria-modal="true"
  tabindex="-1"
  onclose={oncancel}
  onclick={(e) => { if (e.target === dialogEl) oncancel(); }}
>
  <p>{message}</p>
  <div class="actions">
    <button class="btn-secondary" onclick={oncancel}>Cancel</button>
    <button class={confirmClass} onclick={onconfirm}>{confirmLabel}</button>
  </div>
</dialog>

<style>
  dialog {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1.5rem;
    max-width: 320px;
    width: 90%;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  p {
    margin: 0 0 1.25rem;
    color: var(--text);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
