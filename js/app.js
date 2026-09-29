/**
 * app.js — bootstrap. This is the only script loaded by index.html.
 *
 * Startup sequence:
 *   1. load the JSON data (data.js)
 *   2. check it and report problems in the console (validate.js)
 *   3. restore the user's choices from localStorage (state.js)
 *   4. apply the theme (theme.js)
 *   5. wire the header/footer controls (render/chrome.js)
 *   6. declare the routes and start the router (router.js)
 *
 * After that, everything is driven by the URL hash: every change of hash
 * renders a view into <main>, then updates header and footer.
 */
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

/**
 * The route table. "page" groups routes that are the same page for the menu
 * and for prev/next (e.g. #/map and #/map/:id are both the "map" page).
 */
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

  // 1. Load data. The most common failure: opening index.html as a file://
  //    (fetch and ES modules need a web server).
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

  // 2. Check the data (console only)
  validateData(data);

  // 3. Restore saved choices, falling back to the defaults in site.json
  initState({
    themeIds: data.site.themes.map((t) => t.id),
    defaultTheme: data.site.defaultTheme,
    narrativeIds: data.narratives.map((n) => n.identifier),
    defaultNarrative: data.site.defaultNarrative,
  });

  // 4. Theme
  applyTheme(getState().theme);

  // 5. Header and footer. Changing theme or narrative re-renders the current
  //    view, because both can change the layout, the prev/next links, the
  //    route on the map and the narrative-specific texts.
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

  // 6. Routing
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
