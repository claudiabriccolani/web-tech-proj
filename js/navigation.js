// Inside a narrative, prev/next follow its sequence. The other pages follow the
// order of the menu. A location outside the current narrative sits after the map;
// a chapter of another narrative, or an unknown address, sits after the cover.
import { getState, setState } from './state.js';
import { sequenceOf, hashFor, indexOfRoute } from './narrative.js';

const SITE_ORDER = ['cover', 'map', 'about', 'docs', 'disclaimer', 'qr'];
const pageHash = (page) => (page === 'cover' ? '#/' : `#/${page}`);
const afterPage = (page) => pageHash(SITE_ORDER[SITE_ORDER.indexOf(page) + 1]);

export function rememberPosition(route) {
  const { narrativeId, lastPosition } = getState();
  const index = indexOfRoute(sequenceOf(narrativeId), route);
  if (index !== -1 && lastPosition[narrativeId] !== index) {
    setState({ lastPosition: { ...lastPosition, [narrativeId]: index } });
  }
}

export function resumeHash() {
  const { narrativeId, lastPosition } = getState();
  const sequence = sequenceOf(narrativeId);
  if (!sequence.length) return null;
  const index = Math.min(lastPosition[narrativeId] ?? 0, sequence.length - 1);
  return hashFor(sequence[index]);
}

export function computeNav(route) {
  const { narrativeId, lastPosition } = getState();
  const sequence = sequenceOf(narrativeId);
  const nav = { prev: null, next: null, returnTo: null, outside: false, position: null };

  if (route.name === 'location' || route.name === 'chapter') {
    const i = indexOfRoute(sequence, route);
    if (i === -1) {
      nav.outside = true;
      nav.returnTo = resumeHash();
      const onMap = route.name === 'location';
      nav.prev = onMap ? `#/map/${encodeURIComponent(route.params.id)}` : pageHash('cover');
      nav.next = afterPage(onMap ? 'map' : 'cover');
      return nav;
    }
    nav.prev = i > 0 ? hashFor(sequence[i - 1]) : '#/';
    nav.next = i < sequence.length - 1 ? hashFor(sequence[i + 1]) : null;
    nav.position = { current: i + 1, total: sequence.length };
    return nav;
  }

  const p = SITE_ORDER.indexOf(route.page);
  if (p !== -1) {
    nav.prev = p > 0 ? pageHash(SITE_ORDER[p - 1]) : null;
    nav.next = p < SITE_ORDER.length - 1 ? pageHash(SITE_ORDER[p + 1]) : null;
  } else {
    nav.prev = pageHash('cover');
    nav.next = afterPage('cover');
  }
  if (route.page !== 'cover') nav.returnTo = narrativeId in lastPosition ? resumeHash() : null;
  return nav;
}
