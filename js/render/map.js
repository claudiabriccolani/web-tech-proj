/**
 * render/map.js — Leaflet map of all locations (#/map, #/map/:id).
 *
 * Layers, from bottom to top:
 *   1. OpenStreetMap tiles
 *   2. the route of the current narrative (polyline through its steps, in order)
 *   3. for each location: a "view cone" from the camera position, pointing
 *      along lmml:cameraBearing, and a small dot at the camera position
 *   4. a circle marker at the place; clicking it opens the location page
 *
 * Map shapes get CSS classes (lmml-marker, lmml-route, ...) and their
 * colours come from CSS custom properties, so themes can restyle the map.
 *
 * Leaflet is loaded from CDN as the global window.L (see index.html).
 */
import { el } from '../dom.js';
import { getData, getLocation, getNarrative, geoOf, cameraOf } from '../data.js';
import { getState } from '../state.js';
import { sequenceOf } from '../narrative.js';
import { navigate } from '../router.js';

const LONDON = [51.5074, -0.1278];
const CONE_LENGTH_M = 45;     // how far the cone reaches, in metres
const CONE_HALF_ANGLE = 20;   // half of the cone's opening, in degrees
const EARTH_RADIUS_M = 6371000;

export function renderMap(outlet, params) {
  const { locations } = getData();
  const narrative = getNarrative(getState().narrativeId);

  // Locations of the current narrative, in order -> step numbers and route
  const steps = sequenceOf(narrative?.identifier).filter((s) => s.type === 'location');
  const stepNumber = new Map(steps.map((s, i) => [s.locationId, i + 1]));

  const canvas = el('div', { 'data-role': 'map-canvas' });
  outlet.append(
    el('article', { 'data-role': 'map' },
      el('header', { 'data-role': 'page-header' },
        el('h1', { 'data-role': 'page-title' }, 'Map'),
        el('p', { 'data-role': 'map-legend' },
          el('span', { 'data-legend': 'route' }), ` Route: ${narrative?.name ?? '—'} `,
          el('span', { 'data-legend': 'marker' }), ' Filming location ',
          el('span', { 'data-legend': 'cone' }), ' Camera position and direction'),
      ),
      canvas,
    ),
  );

  if (!window.L) {
    canvas.append(el('p', { 'data-role': 'error' }, 'The map library could not be loaded (are you offline?).'));
    return undefined;
  }
  const L = window.L;

  const map = L.map(canvas);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const bounds = [];

  // 2. Route of the current narrative
  const route = steps.map((s) => geoOf(getLocation(s.locationId))).filter(Boolean);
  if (route.length > 1) {
    L.polyline(route, { className: 'lmml-route', interactive: false }).addTo(map);
  }

  for (const loc of locations) {
    const geo = geoOf(loc);
    if (!geo) continue;
    bounds.push(geo);

    // 3. Camera cone and camera dot
    const camera = cameraOf(loc);
    if (camera) {
      drawCamera(L, map, camera);
      bounds.push(camera.latLng);
    }

    // 4. Place marker (numbered tooltip if it is a step of the narrative)
    const n = stepNumber.get(loc.identifier);
    const marker = L.circleMarker(geo, {
      radius: 9,
      className: n ? 'lmml-marker lmml-marker--in-route' : 'lmml-marker',
    }).addTo(map);
    marker.bindTooltip(n ? `${n}. ${loc.name}` : loc.name, { direction: 'top', className: 'lmml-tooltip' });
    marker.on('click', () => navigate(`#/location/${encodeURIComponent(loc.identifier)}`));
  }

  // Initial view: the requested location (#/map/:id), else everything, else London
  const focus = params.id ? geoOf(getLocation(params.id)) : null;
  if (focus) map.setView(focus, 18);
  else if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  else map.setView(LONDON, 12);

  // Leaflet measures its container once: tell it when the size changes
  // (orientation change, theme with a different layout, window resize).
  const observer = new ResizeObserver(() => map.invalidateSize());
  observer.observe(canvas);

  // Cleanup, called by the router before the next view is rendered
  return () => {
    observer.disconnect();
    map.remove();
  };
}

/**
 * The cone is a polygon: the camera position plus points on an arc,
 * from (bearing - 20°) to (bearing + 20°), CONE_LENGTH_M metres away.
 */
function drawCamera(L, map, camera) {
  if (camera.bearing !== null) {
    const points = [camera.latLng];
    for (let offset = -CONE_HALF_ANGLE; offset <= CONE_HALF_ANGLE; offset += 10) {
      points.push(destination(camera.latLng, camera.bearing + offset, CONE_LENGTH_M));
    }
    L.polygon(points, { className: 'lmml-camera-cone', interactive: false }).addTo(map);
  }
  L.circleMarker(camera.latLng, { radius: 4, className: 'lmml-camera', interactive: false }).addTo(map);
}

/**
 * The point reached by walking `metres` from [lat, lng] in direction `bearing`
 * (degrees clockwise from north).
 *
 * For such short distances we can treat the Earth as flat around the point:
 *  - moving north changes latitude:   dLat = distance·cos(bearing) / R
 *  - moving east changes longitude:   dLng = distance·sin(bearing) / (R·cos(lat))
 *    (divided by cos(lat) because meridians get closer towards the poles)
 * Results are in radians and converted back to degrees.
 */
function destination([lat, lng], bearing, metres) {
  const toRad = Math.PI / 180;
  const b = bearing * toRad;
  const dLat = (metres * Math.cos(b)) / EARTH_RADIUS_M;
  const dLng = (metres * Math.sin(b)) / (EARTH_RADIUS_M * Math.cos(lat * toRad));
  return [lat + dLat / toRad, lng + dLng / toRad];
}
