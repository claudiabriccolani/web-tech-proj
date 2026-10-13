let routes = [];
let outlet = null;
let notFound = null;
let onRendered = () => {};
let cleanup = null;

export function defineRoutes(table, options) {
  routes = table;
  outlet = options.outlet;
  notFound = options.notFound;
  onRendered = options.onRendered ?? onRendered;
}

// '#/chapter/historical-timeline/2' against '/chapter/:narrativeId/:n'
// gives params { narrativeId: 'historical-timeline', n: '2' }
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

export function refresh() {
  const route = parseHash();

  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  outlet.replaceChildren();
  outlet.dataset.view = route.page;

  try {
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

export function navigate(hash) {
  if (window.location.hash === hash) refresh();
  else window.location.hash = hash;
}

export function startRouter() {
  window.addEventListener('hashchange', refresh);
  refresh();
}
