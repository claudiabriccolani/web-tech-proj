/**
 * render/disclaimer.js — disclaimer page (#/disclaimer).
 *
 * The text is a template in site.json with three placeholders:
 *   {{sourceNames}}  short list of source websites, e.g. "wikipedia.org and imdb.com"
 *   {{sourceList}}   full list of sources (<ul>), generated from the data
 *   {{author}}       site.json "author"
 *
 * Sources are collected from every location: its "citation" entries and the
 * source page ("url") of every image. Duplicates (same URL) are merged.
 */
import { el, escapeHtml } from '../dom.js';
import { getData } from '../data.js';
import { pageShell } from './page.js';

export function collectSources(locations) {
  const byUrl = new Map();

  const add = (url, description, loc) => {
    if (!url || !/^https?:\/\//.test(url)) return; // skip empty/TODO values
    if (!byUrl.has(url)) byUrl.set(url, { url, description, locations: new Set() });
    byUrl.get(url).locations.add(loc.name);
  };

  for (const loc of locations) {
    for (const c of loc.citation ?? []) add(c.url, c.description, loc);
    for (const img of loc.image ?? []) {
      add(img.url, ['Image', img.caption, img.creditText].filter(Boolean).join(' — '), loc);
    }
  }
  return [...byUrl.values()];
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** ['a','b','c'] -> "a, b and c" */
function formatList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

export function renderDisclaimer(outlet) {
  const { site, locations } = getData();
  const sources = collectSources(locations);
  const names = [...new Set(sources.map((s) => hostnameOf(s.url)))];

  // Built as an HTML string because it is inserted inside the template string.
  // Every value from the data is escaped.
  const listHtml = sources.length
    ? `<ul data-role="source-list">${sources.map((s) => `
        <li data-role="source">
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.url)}</a>
          — ${escapeHtml(s.description ?? '')}
          <span data-role="source-locations">(${escapeHtml([...s.locations].join(', '))})</span>
        </li>`).join('')}</ul>`
    : '<p data-role="source-list">TODO: no sources in the data yet.</p>';

  const html = (site.disclaimer?.template ?? '')
    .replaceAll('{{sourceNames}}', escapeHtml(formatList(names) || 'TODO'))
    .replaceAll('{{sourceList}}', listHtml)
    .replaceAll('{{author}}', escapeHtml(site.author));

  outlet.append(
    pageShell({ page: 'disclaimer', title: site.disclaimer?.title ?? 'Disclaimer' },
      el('div', { 'data-role': 'disclaimer-text', html }),
    ),
  );
}
