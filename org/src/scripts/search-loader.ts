// FILE: src/scripts/search-loader.ts
// PURPOSE: Lazily mounts the docs Search island only on first real interaction
//   (click on a search trigger, or Cmd/Ctrl+K), instead of shipping
//   React + FlexSearch + Headless UI + Algolia autocomplete + highlight-words
//   (~140KB) on every page load for a modal most visitors never open.
// INPUTS: window 'open-search' CustomEvent (dispatched by Header.astro on
//   trigger click), Cmd/Ctrl+K keydown
// OUTPUTS: mounts <Search /> into #search-island-root on first trigger, then
//   re-dispatches 'open-search' so the freshly-mounted component's own
//   listener (registered in its useEffect) opens the dialog immediately.
// CONSTRAINTS: idempotent — mounts at most once per page load; no dependency
//   on the Search component's internals beyond its default export + its own
//   'open-search' listener contract.
// REF: PageSpeed/Lighthouse-100 audit — Search island lazy-mount fix

let mounted = false;

async function mountSearch(): Promise<void> {
  if (mounted) return;
  mounted = true;

  const [{ default: Search }, { createRoot }, React] = await Promise.all([
    import('../components/islands/Search'),
    import('react-dom/client'),
    import('react'),
  ]);

  const container = document.getElementById('search-island-root');
  if (!container) return;

  createRoot(container).render(React.createElement(Search));

  // The just-mounted component subscribes to 'open-search' inside a
  // useEffect, which runs on the next frame — re-fire the trigger so the
  // event that caused this mount isn't lost.
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('open-search'));
  });
}

window.addEventListener('open-search', mountSearch, { once: true });
window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    mountSearch();
  }
});
