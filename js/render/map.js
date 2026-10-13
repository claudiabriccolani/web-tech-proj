import { el } from '../dom.js';
import { getData, getLocation, getNarrative, geoOf, cameraOf } from '../data.js';
import { getState } from '../state.js';
import { sequenceOf } from '../narrative.js';
import { navigate } from '../router.js';

const LONDON = [51.5074, -0.1278];
const CONE_LENGTH_M = 45;
const CONE_HALF_ANGLE = 20;   
const ARROW_HEAD_M = 12;
const EARTH_RADIUS_M = 6371000;

export function renderMap(outlet, params) {
  const { locations } = getData();
  const narrative = getNarrative(getState().narrativeId);

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
          el('span', { 'data-legend': 'cone' }), ' Camera position and direction (estimated)'),
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

  const route = steps.map((s) => geoOf(getLocation(s.locationId))).filter(Boolean);
  if (route.length > 1) {
    L.polyline(route, { className: 'lmml-route', interactive: false }).addTo(map);
  }

  for (const loc of locations) {
    const geo = geoOf(loc);
    if (!geo) continue;
    bounds.push(geo);

    const camera = cameraOf(loc);
    if (camera) {
      drawCamera(L, map, camera);
      bounds.push(camera.latLng);
    }

    const n = stepNumber.get(loc.identifier);
    const marker = L.circleMarker(geo, {
      radius: 9,
      className: n ? 'lmml-marker lmml-marker--in-route' : 'lmml-marker',
    }).addTo(map);
    marker.bindTooltip(n ? `${n}. ${loc.name}` : loc.name, { direction: 'top', className: 'lmml-tooltip' });
    marker.on('click', () => navigate(`#/location/${encodeURIComponent(loc.identifier)}`));
  }

  const focus = params.id ? geoOf(getLocation(params.id)) : null;
  if (focus) map.setView(focus, 18);
  else if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  else map.setView(LONDON, 12);

  const observer = new ResizeObserver(() => map.invalidateSize());
  observer.observe(canvas);

  return () => {
    observer.disconnect();
    map.remove();
  };
}

function drawCamera(L, map, camera) {
  if (camera.bearing !== null) {
    const points = [camera.latLng];
    for (let offset = -CONE_HALF_ANGLE; offset <= CONE_HALF_ANGLE; offset += 10) {
      points.push(destination(camera.latLng, camera.bearing + offset, CONE_LENGTH_M));
    }
    L.polygon(points, { className: 'lmml-camera-cone', interactive: false }).addTo(map);

    const tip = destination(camera.latLng, camera.bearing, CONE_LENGTH_M);
    L.polyline([
      [camera.latLng, tip],
      [destination(tip, camera.bearing + 150, ARROW_HEAD_M), tip, destination(tip, camera.bearing - 150, ARROW_HEAD_M)],
    ], { className: 'lmml-camera-arrow', interactive: false }).addTo(map);
  }
  L.circleMarker(camera.latLng, { radius: 4, className: 'lmml-camera', interactive: false }).addTo(map);
}

function destination([lat, lng], bearing, metres) {
  const toRad = Math.PI / 180;
  const b = bearing * toRad;
  const dLat = (metres * Math.cos(b)) / EARTH_RADIUS_M;
  const dLng = (metres * Math.sin(b)) / (EARTH_RADIUS_M * Math.cos(lat * toRad));
  return [lat + dLat / toRad, lng + dLng / toRad];
}
