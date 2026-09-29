/**
 * data.js — loads the three JSON files and offers small "accessor" functions.
 *
 * Why accessors? The JSON uses schema.org / lmml: property names, some of which
 * contain a colon ("lmml:cameraBearing"). In JavaScript these need bracket
 * notation: loc['lmml:cameraBearing']. Keeping those accesses here means the
 * views stay readable and, if the data model changes, only this file changes.
 */

const FILES = {
  site: 'data/site.json',
  locations: 'data/locations.json',
  narratives: 'data/narratives.json',
};

/** All loaded data lives here after loadData() has run. */
let DATA = null;

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

/**
 * Load the three files in parallel and build lookup tables (Map by id),
 * so that "find location by id" is a single .get() instead of a loop.
 */
export async function loadData() {
  const [site, locationsDoc, narrativesDoc] = await Promise.all([
    fetchJson(FILES.site),
    fetchJson(FILES.locations),
    fetchJson(FILES.narratives),
  ]);

  const locations = locationsDoc.locations ?? [];
  const narratives = narrativesDoc.narratives ?? [];

  DATA = {
    site,
    locations,
    narratives,
    locationsById: new Map(locations.map((loc) => [loc.identifier, loc])),
    narrativesById: new Map(narratives.map((n) => [n.identifier, n])),
  };
  return DATA;
}

export function getData() {
  if (!DATA) throw new Error('Data not loaded yet: call loadData() first');
  return DATA;
}

export const getLocation = (id) => getData().locationsById.get(id) ?? null;
export const getNarrative = (id) => getData().narrativesById.get(id) ?? null;

/* ---------- Accessors for a location ---------- */

/** [lat, lng] of the place itself (Leaflet's coordinate format), or null. */
export function geoOf(loc) {
  const g = loc?.geo;
  return g && typeof g.latitude === 'number' ? [g.latitude, g.longitude] : null;
}

/** Camera position [lat, lng] and bearing in degrees from north, or null. */
export function cameraOf(loc) {
  const c = loc?.['lmml:cameraPosition'];
  if (!c || typeof c.latitude !== 'number') return null;
  const bearing = loc['lmml:cameraBearing'];
  return { latLng: [c.latitude, c.longitude], bearing: typeof bearing === 'number' ? bearing : null };
}

/** The Movie / TVEpisode the location appears in. */
export const workOf = (loc) => loc?.['lmml:appearsIn'] ?? null;

/** The default texts of a location (may be replaced by narrative texts, see render/location.js). */
export const textsOf = (loc) => loc?.['lmml:texts'] ?? [];

/** "2003-11-21" -> "2003" */
export const yearOf = (date) => String(date ?? '').slice(0, 4);

/** Human-readable label for a work: "Love Actually (2003)" or "Sherlock – Episode (2010)". */
export function workLabel(work) {
  if (!work) return '';
  const series = work.partOfSeries?.name;
  const title = series ? `${series} – ${work.name}` : work.name;
  const year = yearOf(work.datePublished);
  return year ? `${title} (${year})` : title;
}

/**
 * Absolute URL of a location page, used in QR codes.
 * If site.json has a "baseUrl" (the deployed site) we use it, so that QR codes
 * printed during development still point to the public site. Otherwise we use
 * the address the page is currently served from.
 */
export function locationUrl(id) {
  const base = getData().site.baseUrl || `${window.location.origin}${window.location.pathname}`;
  return `${base.replace(/#.*$/, '')}#/location/${encodeURIComponent(id)}`;
}
