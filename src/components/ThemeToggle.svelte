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

<button class="theme-toggle" onclick={toggle} aria-label="Toggle theme" title={theme === 'dark' ? 'Switch to light skin' : 'Switch to dark skin'}>
  {theme === 'dark' ? '☀' : '☾'}
</button>

<style>
  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text-muted);
    font-size: 0.95rem;
    padding: 0.28rem 0.55rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .theme-toggle:hover {
    background: var(--hover);
    color: var(--text);
    border-color: var(--accent);
  }
</style>
