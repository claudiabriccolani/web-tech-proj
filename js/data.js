const FILES = {
  site: 'data/site.json',
  locations: 'data/locations.json',
  narratives: 'data/narratives.json',
};

let DATA = null;

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

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

// [lat, lng], the order Leaflet expects
export function geoOf(loc) {
  const g = loc?.geo;
  return g && typeof g.latitude === 'number' ? [g.latitude, g.longitude] : null;
}

export function cameraOf(loc) {
  const c = loc?.['lmml:cameraPosition'];
  if (!c || typeof c.latitude !== 'number') return null;
  const bearing = loc['lmml:cameraBearing'];
  return { latLng: [c.latitude, c.longitude], bearing: typeof bearing === 'number' ? bearing : null };
}

export const workOf = (loc) => loc?.['lmml:appearsIn'] ?? null;

// "trailer" holds a trailer, "video" a clip
export function videoOf(loc) {
  const work = workOf(loc);
  return work?.trailer ?? work?.video ?? null;
}

export const quizOf = (loc) => loc?.['lmml:quiz'] ?? null;

export const textsOf = (loc) => loc?.['lmml:texts'] ?? [];

export const yearOf = (date) => String(date ?? '').slice(0, 4);

export function workLabel(work) {
  if (!work) return '';
  const series = work.partOfSeries?.name;
  const title = series ? `${series} – ${work.name}` : work.name;
  const year = yearOf(work.datePublished);
  return year ? `${title} (${year})` : title;
}

// baseUrl keeps printed QR codes pointing at the public site, even from localhost
export function locationUrl(id) {
  const base = getData().site.baseUrl || `${window.location.origin}${window.location.pathname}`;
  return `${base.replace(/#.*$/, '')}#/location/${encodeURIComponent(id)}`;
}
