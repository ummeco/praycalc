// FILE: src/components/islands/Search.tsx
// PURPOSE: Docs search modal island for praycalc.org.
//   Listens for window CustomEvent 'open-search' (dispatched by Header.astro)
//   and Cmd/Ctrl+K. Renders a Headless UI Dialog wired to
//   @algolia/autocomplete-core (keyboard/ARIA + navigation) over a FlexSearch
//   index built from the static /search-index.json (src/lib/search-index.ts).
// INPUTS: window 'open-search' event, /search-index.json (fetched once)
// OUTPUTS: Accessible search modal rendered on every page via Base.astro
// CONSTRAINTS:
//   - No next/* imports — navigate via window.location.href
//   - client:idle directive in Base.astro keeps it out of SSR critical path
//   - Split into src/components/islands/search/* to stay under the 300-line
//     file cap: icons.tsx, SearchResults.tsx, SearchInput.tsx,
//     useAutocomplete.ts, types.ts. Index/search logic lives in
//     src/lib/search-index.ts.
// REF: Epic C (docs search)

'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getIndex } from '../../lib/search-index';
import { SearchInput } from './search/SearchInput';
import { SearchResults } from './search/SearchResults';
import { useAutocomplete } from './search/useAutocomplete';

function SearchDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { autocomplete, autocompleteState } = useAutocomplete({
    onNavigate() {
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        autocomplete.setQuery('');
      }}
      className="fixed inset-0 z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-400/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />

      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-zinc-50 shadow-xl ring-1 ring-zinc-900/7.5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <div {...autocomplete.getRootProps({})}>
            <form
              ref={formRef}
              {...autocomplete.getFormProps({
                inputElement: inputRef.current,
              })}
            >
              <SearchInput
                ref={inputRef}
                autocomplete={autocomplete}
                autocompleteState={autocompleteState}
                onClose={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                className="border-t border-zinc-200 bg-white empty:hidden dark:border-zinc-100/5 dark:bg-white/2.5"
                {...autocomplete.getPanelProps({})}
              >
                {autocompleteState.isOpen &&
                  autocompleteState.collections?.[0] && (
                    <SearchResults
                      autocomplete={autocomplete}
                      query={autocompleteState.query}
                      collection={autocompleteState.collections[0]}
                    />
                  )}
              </div>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default function Search() {
  const [open, setOpen] = useState(false);

  const setOpenStable = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  // Listen for the 'open-search' CustomEvent dispatched by Header.astro
  useEffect(() => {
    function onOpenSearch() {
      setOpenStable(true);
      // Warm up the index in the background on first trigger
      getIndex().catch(() => {});
    }

    window.addEventListener('open-search', onOpenSearch);
    return () => window.removeEventListener('open-search', onOpenSearch);
  }, [setOpenStable]);

  // Cmd/Ctrl+K shortcut (harmless duplicate alongside Header.astro's dispatcher)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenStable(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setOpenStable]);

  return <SearchDialog open={open} setOpen={setOpenStable} />;
}
