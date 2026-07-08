// FILE: src/lib/search-index.ts
// PURPOSE: FlexSearch client-side index singleton for docs search.
//   Builds a FlexSearch.Document index from /search-index.json (fetched once)
//   and exposes search(query) returning deduped Result records.
// INPUTS: /search-index.json (static, generated at build time by
//   src/scripts/build-search-index.mjs)
// OUTPUTS: getIndex() (warms/returns the singleton), search(query, limit)
// CONSTRAINTS:
//   - FlexSearch's published TS types don't model the Document API precisely
//     enough for our usage — the 3 `any` escapes here (indexPromise/builtIndex
//     singleton + raw search() results) are the pre-existing, documented
//     exceptions carried over from the original Search.tsx implementation.
// REF: Epic C (docs search)

export interface SearchRecord {
  url: string;
  title: string;
  pageTitle?: string;
  hash: string;
  heading: string;
  content: string;
}

export interface Result {
  /** Full URL including hash, e.g. /science/solar-position#why-solar-position-matters */
  url: string;
  title: string;
  pageTitle?: string;
  /** Index signature to satisfy @algolia/autocomplete-core's BaseItem constraint. */
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let indexPromise: Promise<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let builtIndex: any | null = null;

export async function getIndex() {
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

export async function search(query: string, limit = 6): Promise<Result[]> {
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
