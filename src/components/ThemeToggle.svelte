<script lang="ts">
  let theme = $state(localStorage.getItem('theme') ?? 'dark');

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }
</script>

<button class="theme-toggle" onclick={toggle} aria-label="Toggle theme">
  {theme === 'dark' ? '☀' : '☾'}
</button>

<style>
  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 1.1rem;
    padding: 0.35rem 0.6rem;
    flex-shrink: 0;
  }

  .theme-toggle:hover {
    background: var(--hover);
    color: var(--text);
  }
</style>
