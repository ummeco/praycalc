// FILE: src/scripts/build-search-index.mjs
// PURPOSE: Build-time search index generator for praycalc.org docs.
//   Globs all English MDX pages under src/pages/, extracts frontmatter title
//   and h2 sections with paragraph content, writes public/search-index.json.
// INPUTS: src/pages/**/*.mdx (English only — skips ar/fa/id/ur locale dirs)
// OUTPUTS: public/search-index.json — array of { url, title, pageTitle, hash, heading, content }
// CONSTRAINTS:
//   - Plain Node ESM; no bundler dependency
//   - Uses gray-matter for frontmatter, @sindresorhus/slugify for heading ids
//   - Matches Astro's default heading slug behavior (lowercase, hyphenated)
// REF: Epic C (docs search)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, relative, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import matter from 'gray-matter';
import slugify from '@sindresorhus/slugify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const pagesDir = join(root, 'src', 'pages');
const outputDir = join(root, 'public');
const outputFile = join(outputDir, 'search-index.json');

// Locale stub directories to skip — no real English content
const LOCALE_SKIP = new Set(['ar', 'fa', 'id', 'ur']);

// Convert a file path under src/pages to a URL path
function fileToUrl(filePath) {
  const rel = relative(pagesDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.mdx$/, '');

  // index files -> parent dir URL
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) return '/' + rel.replace(/\/index$/, '');
  return '/' + rel;
}

// Parse a markdown body into sections.
// Each h2 (##) starts a new section. Content before the first h2 goes into the
// h1 section (hash='').
// Returns array of { heading, hash, content (joined paragraphs) }
function parseSections(body, pageTitle) {
  const lines = body.split('\n');
  const sections = [];

  // Bootstrap with the h1 section (page-level intro)
  let current = { heading: pageTitle, hash: '', paragraphs: [] };

  for (const line of lines) {
    // Match h2 headings only
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      sections.push(current);
      const headingText = h2[1].trim();
      current = {
        heading: headingText,
        hash: '#' + slugify(headingText),
        paragraphs: [],
      };
      continue;
    }

    // Skip code fences, imports, JSX, empty lines
    if (
      line.startsWith('```') ||
      line.startsWith('import ') ||
      line.startsWith('export ') ||
      line.startsWith('<') ||
      line.startsWith('{') ||
      line.startsWith('#') ||
      line.trim() === ''
    ) {
      continue;
    }

    // Strip inline markdown: bold, italic, backticks, links
    const clean = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/^[-*+]\s+/, '')   // list bullets
      .replace(/^\d+\.\s+/, '')  // ordered list
      .trim();

    if (clean) {
      current.paragraphs.push(clean);
    }
  }

  sections.push(current);
  return sections;
}

async function main() {
  // Find all MDX files, skip locale stubs
  const files = await fg('**/*.mdx', { cwd: pagesDir, absolute: true });

  const englishFiles = files.filter((f) => {
    const rel = relative(pagesDir, f).replace(/\\/g, '/');
    const topDir = rel.split('/')[0];
    return !LOCALE_SKIP.has(topDir);
  });

  const records = [];

  for (const filePath of englishFiles) {
    const raw = readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(raw);

    const pageTitle = frontmatter.title ?? '';
    if (!pageTitle) continue; // skip pages without a title

    const url = fileToUrl(filePath);
    const sections = parseSections(body, pageTitle);

    for (const { heading, hash, paragraphs } of sections) {
      const content = [heading, ...paragraphs].join(' ');
      records.push({
        url,
        title: heading,
        pageTitle: hash ? pageTitle : undefined,
        hash,
        heading,
        content,
      });
    }
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputFile, JSON.stringify(records, null, 0));

  console.log(`[search-index] wrote ${records.length} records from ${englishFiles.length} pages → public/search-index.json`);

  // Print one sample record
  if (records.length > 0) {
    const sample = records.find((r) => r.hash) ?? records[0];
    console.log('[search-index] sample:', JSON.stringify(sample, null, 2));
  }
}

main().catch((err) => {
  console.error('[search-index] ERROR:', err);
  process.exit(1);
});
