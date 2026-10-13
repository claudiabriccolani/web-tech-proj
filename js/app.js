import { el } from './dom.js';
import { loadData } from './data.js';
import { validateData } from './validate.js';
import { initState, getState, setState } from './state.js';
import { applyTheme } from './theme.js';
import { defineRoutes, startRouter, refresh } from './router.js';
import { rememberPosition } from './navigation.js';
import { initChrome, updateChrome } from './render/chrome.js';

import { renderCover } from './render/cover.js';
import { renderMap } from './render/map.js';
import { renderLocation } from './render/location.js';
import { renderChapter } from './render/chapter.js';
import { renderAbout } from './render/about.js';
import { renderDocs } from './render/docs.js';
import { renderDisclaimer } from './render/disclaimer.js';
import { renderQrSheet } from './render/qr.js';
import { renderNotFound } from './render/notFound.js';

// "page" groups the routes that share a menu entry and a place in prev/next
const ROUTES = [
  { path: '/', name: 'cover', page: 'cover', render: renderCover },
  { path: '/map', name: 'map', page: 'map', render: renderMap },
  { path: '/map/:id', name: 'map-focus', page: 'map', render: renderMap },
  { path: '/location/:id', name: 'location', page: 'location', render: renderLocation },
  { path: '/chapter/:narrativeId/:n', name: 'chapter', page: 'chapter', render: renderChapter },
  { path: '/about', name: 'about', page: 'about', render: renderAbout },
  { path: '/docs', name: 'docs', page: 'docs', render: renderDocs },
  { path: '/docs/:section', name: 'docs-section', page: 'docs', render: renderDocs },
  { path: '/disclaimer', name: 'disclaimer', page: 'disclaimer', render: renderDisclaimer },
  { path: '/qr', name: 'qr', page: 'qr', render: renderQrSheet },
];

async function main() {
  const outlet = document.querySelector('[data-role="view"]');

  // fetch and ES modules do not work on file://, which is the usual cause
  let data;
  try {
    data = await loadData();
  } catch (error) {
    console.error(error);
    outlet.replaceChildren(
      el('p', { 'data-role': 'error' },
        `Could not load the data files (${error.message}). `,
        'Serve this folder with a local web server (e.g. "python -m http.server 8000") instead of opening index.html directly.'),
    );
    return;
  }

  validateData(data);

  initState({
    themeIds: data.site.themes.map((t) => t.id),
    defaultTheme: data.site.defaultTheme,
    narrativeIds: data.narratives.map((n) => n.identifier),
    defaultNarrative: data.site.defaultNarrative,
  });

  applyTheme(getState().theme);

  // Theme and narrative both change the layout, prev/next and the map route
  initChrome({
    onThemeChange(themeId) {
      setState({ theme: themeId });
      applyTheme(themeId);
      refresh();
    },
    onNarrativeChange(narrativeId) {
      setState({ narrativeId });
      refresh();
    },
  });

  defineRoutes(ROUTES, {
    outlet,
    notFound: renderNotFound,
    onRendered(route) {
      rememberPosition(route);
      updateChrome(route);
    },
  });
  startRouter();
}

main();
