// FILE: src/components/islands/search/useAutocomplete.ts
// PURPOSE: React hook wrapping @algolia/autocomplete-core's createAutocomplete
//   for the docs search dialog — wires the single "documentation" source to
//   the FlexSearch index in src/lib/search-index.ts. Split out of Search.tsx.
// REF: Epic C (docs search)

import { useId, useState } from 'react';
import { createAutocomplete } from '@algolia/autocomplete-core';
import type { AutocompleteState } from '@algolia/autocomplete-core';
import { search, type Result } from '../../../lib/search-index';
import type { Autocomplete, EmptyObject } from './types';

export function useAutocomplete({ onNavigate }: { onNavigate: () => void }) {
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
