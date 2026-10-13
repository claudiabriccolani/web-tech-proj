import { el, escapeHtml } from '../dom.js';
import { getData, videoOf } from '../data.js';
import { pageShell } from './page.js';

export function collectSources(locations) {
  const byUrl = new Map();

  const add = (url, description, loc, license) => {
    if (!url || !/^https?:\/\//.test(url)) return;
    if (!byUrl.has(url)) byUrl.set(url, { url, descriptions: [], license: null, locations: new Set() });
    const source = byUrl.get(url);
    if (description && !source.descriptions.includes(description)) source.descriptions.push(description);
    if (license) source.license = license;
    source.locations.add(loc.name);
  };

  for (const loc of locations) {
    for (const c of loc.citation ?? []) add(c.url, c.description, loc, c.license);
    for (const img of loc.image ?? []) {
      add(img.url, ['Image', img.caption, img.creditText].filter(Boolean).join(' — '), loc, img.license);
    }
    const video = videoOf(loc);
    if (video) {
      const channel = video.publisher?.name && `${video.publisher.name}, official channel on YouTube`;
      add(video.url, ['Video', video.name, channel].filter(Boolean).join(' — '), loc);
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

function formatList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

export function renderDisclaimer(outlet) {
  const { site, locations } = getData();
  const docs = site.docsReferences ? [{ name: 'Documentation', ...site.docsReferences }] : [];
  const map = site.mapReferences ? [{ name: 'Map', ...site.mapReferences }] : [];
  const sources = collectSources([...locations, ...docs, ...map]);
  const names = [...new Set(sources.map((s) => hostnameOf(s.url)))];

  const listHtml = sources.length
    ? `<ul data-role="source-list">${sources.map((s) => `
        <li data-role="source">
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.url)}</a>
          — ${escapeHtml(s.descriptions.join(' · '))}
          ${/^https?:/.test(s.license ?? '') ? `<a data-role="source-license" href="${escapeHtml(s.license)}" target="_blank" rel="noopener">Licence</a>` : (s.license ? `<span data-role="source-license">${escapeHtml(s.license)}</span>` : '')}
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
