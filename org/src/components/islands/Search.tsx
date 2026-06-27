// FILE: src/components/islands/Search.tsx
// PURPOSE: Docs search modal island for praycalc.org.
//   Listens for window CustomEvent 'open-search' (dispatched by Header.astro)
//   and Cmd/Ctrl+K. On first open, fetches /search-index.json and builds a
//   FlexSearch.Document index. Renders a Headless UI Dialog with
//   @algolia/autocomplete-core for keyboard/ARIA, react-highlight-words for
//   query highlighting. Click/Enter navigates via window.location.href.
// INPUTS: window 'open-search' event, /search-index.json (fetched once)
// OUTPUTS: Accessible search modal rendered on every page via Base.astro
// CONSTRAINTS:
//   - No next/* imports — navigate via window.location.href
//   - FlexSearch.Document index built client-side from the static JSON
//   - client:idle directive in Base.astro keeps it out of SSR critical path
// REF: Epic C (docs search)

'use client';

import {
  createAutocomplete,
  type AutocompleteApi,
  type AutocompleteCollection,
  type AutocompleteState,
} from '@algolia/autocomplete-core';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import clsx from 'clsx';
import { forwardRef, Fragment, useCallback, useEffect, useId, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchRecord {
  url: string;
  title: string;
  pageTitle?: string;
  hash: string;
  heading: string;
  content: string;
}

interface Result {
  /** Full URL including hash, e.g. /science/solar-position#why-solar-position-matters */
  url: string;
  title: string;
  pageTitle?: string;
  /** Index signature to satisfy @algolia/autocomplete-core's BaseItem constraint. */
  [key: string]: unknown;
}

type EmptyObject = Record<string, never>;

type Autocomplete = AutocompleteApi<
  Result,
  React.SyntheticEvent,
  React.MouseEvent,
  React.KeyboardEvent
>;

// ── FlexSearch index (singleton, built once per session) ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let indexPromise: Promise<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let builtIndex: any | null = null;

async function getIndex() {
  if (builtIndex) return builtIndex;
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    const FlexSearch = (await import('flexsearch')).default ?? (await import('flexsearch'));
    const res = await fetch('/search-index.json');
    const records: SearchRecord[] = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idx = new (FlexSearch as any).Document({
      tokenize: 'forward',
      document: {
        id: 'url',
        index: ['heading', 'content'],
        store: ['title', 'pageTitle', 'hash', 'url'],
      },
    });

    for (const record of records) {
      idx.add({
        url: record.url + record.hash,
        title: record.title,
        pageTitle: record.pageTitle,
        hash: record.hash,
        heading: record.heading,
        content: record.content,
      });
    }

    builtIndex = idx;
    return idx;
  })();

  return indexPromise;
}

async function search(query: string, limit = 6): Promise<Result[]> {
  const idx = await getIndex();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = idx.search(query, { limit, enrich: true });
  if (!raw.length) return [];

  const seen = new Set<string>();
  const results: Result[] = [];

  for (const field of raw) {
    for (const item of field.result ?? []) {
      const url = item.id as string;
      if (seen.has(url)) continue;
      seen.add(url);
      results.push({
        url,
        title: item.doc?.title ?? '',
        pageTitle: item.doc?.pageTitle,
      });
    }
  }

  return results;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25" />
    </svg>
  );
}

function NoResultsIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.01 12a4.237 4.237 0 0 0 1.24-3c0-.62-.132-1.207-.37-1.738M12.01 12A4.237 4.237 0 0 1 9 13.25c-.635 0-1.237-.14-1.777-.388M12.01 12l3.24 3.25m-3.715-9.661a4.25 4.25 0 0 0-5.975 5.908M4.5 15.5l11-11" />
    </svg>
  );
}

function LoadingIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  const id = useId();
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="5.5" strokeLinejoin="round" />
      <path stroke={`url(#${id})`} strokeLinecap="round" strokeLinejoin="round" d="M15.5 10a5.5 5.5 0 1 0-5.5 5.5" />
      <defs>
        <linearGradient id={id} x1="13" x2="9.5" y1="9" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function HighlightQuery({ text, query }: { text: string; query: string }) {
  return (
    <Highlighter
      highlightClassName="underline bg-transparent text-emerald-500"
      searchWords={[query]}
      autoEscape={true}
      textToHighlight={text}
    />
  );
}

function SearchResult({
  result,
  resultIndex,
  autocomplete,
  collection,
  query,
}: {
  result: Result;
  resultIndex: number;
  autocomplete: Autocomplete;
  collection: AutocompleteCollection<Result>;
  query: string;
}) {
  const id = useId();
  const hierarchy = [result.pageTitle].filter((x): x is string => typeof x === 'string');

  return (
    <li
      className={clsx(
        'group block cursor-default px-4 py-3 aria-selected:bg-zinc-50 dark:aria-selected:bg-zinc-800/50',
        resultIndex > 0 && 'border-t border-zinc-100 dark:border-zinc-800',
      )}
      aria-labelledby={`${id}-hierarchy ${id}-title`}
      {...autocomplete.getItemProps({ item: result, source: collection.source })}
    >
      <div
        id={`${id}-title`}
        aria-hidden="true"
        className="text-sm font-medium text-zinc-900 group-aria-selected:text-emerald-500 dark:text-white"
      >
        <HighlightQuery text={result.title} query={query} />
      </div>
      {hierarchy.length > 0 && (
        <div
          id={`${id}-hierarchy`}
          aria-hidden="true"
          className="mt-1 truncate text-xs whitespace-nowrap text-zinc-500"
        >
          {hierarchy.map((item, itemIndex, items) => (
            <Fragment key={itemIndex}>
              <HighlightQuery text={item} query={query} />
              <span
                className={
                  itemIndex === items.length - 1
                    ? 'sr-only'
                    : 'mx-2 text-zinc-300 dark:text-zinc-700'
                }
              >
                /
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </li>
  );
}

function SearchResults({
  autocomplete,
  query,
  collection,
}: {
  autocomplete: Autocomplete;
  query: string;
  collection: AutocompleteCollection<Result>;
}) {
  if (collection.items.length === 0) {
    return (
      <div className="p-6 text-center">
        <NoResultsIcon className="mx-auto h-5 w-5 stroke-zinc-900 dark:stroke-zinc-600" />
        <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-400">
          Nothing found for{' '}
          <strong className="font-semibold break-all text-zinc-900 dark:text-white">
            &lsquo;{query}&rsquo;
          </strong>
          . Please try again.
        </p>
      </div>
    );
  }

  return (
    <ul {...autocomplete.getListProps()}>
      {collection.items.map((result, resultIndex) => (
        <SearchResult
          key={result.url}
          result={result}
          resultIndex={resultIndex}
          autocomplete={autocomplete}
          collection={collection}
          query={query}
        />
      ))}
    </ul>
  );
}

const SearchInput = forwardRef<
  HTMLInputElement,
  {
    autocomplete: Autocomplete;
    autocompleteState: AutocompleteState<Result> | EmptyObject;
    onClose: () => void;
  }
>(function SearchInput({ autocomplete, autocompleteState, onClose }, inputRef) {
  const inputProps = autocomplete.getInputProps({ inputElement: null });

  return (
    <div className="group relative flex h-12">
      <SearchIcon className="pointer-events-none absolute top-0 left-3 h-full w-5 stroke-zinc-500" />
      <input
        ref={inputRef}
        data-autofocus
        className={clsx(
          'flex-auto appearance-none bg-transparent pl-10 text-zinc-900 outline-hidden placeholder:text-zinc-500 focus:w-full focus:flex-none sm:text-sm dark:text-white [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden',
          autocompleteState.status === 'stalled' ? 'pr-11' : 'pr-4',
        )}
        {...inputProps}
        onKeyDown={(event) => {
          if (
            event.key === 'Escape' &&
            !autocompleteState.isOpen &&
            autocompleteState.query === ''
          ) {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            onClose();
          } else {
            inputProps.onKeyDown(event);
          }
        }}
      />
      {autocompleteState.status === 'stalled' && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <LoadingIcon className="h-5 w-5 animate-spin stroke-zinc-200 text-zinc-900 dark:stroke-zinc-800 dark:text-emerald-400" />
        </div>
      )}
    </div>
  );
});

// ── useAutocomplete ───────────────────────────────────────────────────────────

function useAutocomplete({ onNavigate }: { onNavigate: () => void }) {
  const id = useId();
  const [autocompleteState, setAutocompleteState] = useState<
    AutocompleteState<Result> | EmptyObject
  >({});

  function navigate({ itemUrl }: { itemUrl?: string }) {
    if (itemUrl) {
      window.location.href = itemUrl;
    }
    onNavigate();
  }

  const [autocomplete] = useState<Autocomplete>(() =>
    createAutocomplete<Result, React.SyntheticEvent, React.MouseEvent, React.KeyboardEvent>({
      id,
      placeholder: 'Find something...',
      defaultActiveItemId: 0,
      onStateChange({ state }) {
        setAutocompleteState(state);
      },
      shouldPanelOpen({ state }) {
        return state.query !== '';
      },
      navigator: { navigate },
      getSources({ query }) {
        return [
          {
            sourceId: 'documentation',
            async getItems() {
              return search(query, 6);
            },
            getItemUrl({ item }) {
              return item.url;
            },
            onSelect: navigate,
          },
        ];
      },
    }),
  );

  return { autocomplete, autocompleteState };
}

// ── SearchDialog ──────────────────────────────────────────────────────────────

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

// ── Root export ───────────────────────────────────────────────────────────────

export default function Search() {
  const [open, setOpen] = useState(false);

  const setOpenStable = useCallback(
    (next: boolean) => {
      setOpen(next);
    },
    [],
  );

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
