// FILE: src/components/islands/search/types.ts
// PURPOSE: Shared type aliases for the docs search island (Autocomplete API
//   generics, empty-state type). Split out of Search.tsx.
// REF: Epic C (docs search)

import type { AutocompleteApi } from '@algolia/autocomplete-core';
import type { Result } from '../../../lib/search-index';

export type EmptyObject = Record<string, never>;

export type Autocomplete = AutocompleteApi<
  Result,
  React.SyntheticEvent,
  React.MouseEvent,
  React.KeyboardEvent
>;
