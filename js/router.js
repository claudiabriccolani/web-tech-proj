/**
 * router.js — hash-based routing for a single-page app.
 *
 * The part of the URL after "#" decides the view:
 *   #/location/marylebone-station  ->  route "location", params { id: 'marylebone-station' }
 *
 * The hash never reaches the server, so a simple static server is enough and
 * the browser's back/forward buttons work for free (each hash change is a
 * history entry). We listen to the "hashchange" event and re-render.
 *
 * Routes are declared in app.js as a table:
 *   { path: '/location/:id', name: 'location', page: 'location', render: renderLocation }
 * ":id" is a parameter. "page" groups routes that are the same page
 * (e.g. /map and /map/:id) for the menu and navigation.
 */

let routes = [];
let outlet = null;          // the <main> element where views are rendered
let notFound = null;        // render function for unknown hashes
let onRendered = () => {};  // called after every render (updates header/footer)
let cleanup = null;         // function returned by the previous view (e.g. to destroy a map)

export function defineRoutes(table, options) {
  routes = table;
  outlet = options.outlet;
  notFound = options.notFound;
  onRendered = options.onRendered ?? onRendered;
}

/**
 * Turn a hash into a route match.
 * '#/chapter/historical-timeline/2' against '/chapter/:narrativeId/:n'
 *   -> { name: 'chapter', params: { narrativeId: 'historical-timeline', n: '2' }, ... }
 */
export function parseHash(hash = window.location.hash) {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  for (const route of routes) {
    const pattern = route.path.split('/').filter(Boolean);
    if (pattern.length !== parts.length) continue;

    const params = {};
    const matches = pattern.every((segment, i) => {
      if (segment.startsWith(':')) {
        params[segment.slice(1)] = decodeURIComponent(parts[i]);
        return true;
      }
      return segment === parts[i];
    });

    if (matches) return { ...route, params };
  }
  return { name: 'not-found', page: 'not-found', render: notFound, params: { path } };
}

/** Render the view for the current hash. */
export function refresh() {
  const route = parseHash();

  // Let the previous view clean up (remove listeners, destroy the Leaflet map, ...)
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  outlet.replaceChildren();
  outlet.dataset.view = route.page;

  try {
    // A view may return a cleanup function; we keep it for the next render.
    cleanup = route.render(outlet, route.params, route) ?? null;
  } catch (error) {
    console.error(error);
    const message = document.createElement('p');
    message.dataset.role = 'error';
    message.textContent = `Error while rendering this page: ${error.message}`;
    outlet.replaceChildren(message);
  }

  onRendered(route);
}

/** Go to a hash. If we are already there, just re-render. */
export function navigate(hash) {
  if (window.location.hash === hash) refresh();
  else window.location.hash = hash;
}

export function startRouter() {
  window.addEventListener('hashchange', refresh);
  refresh();
}
