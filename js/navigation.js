/**
 * navigation.js — decides where "Previous", "Next" and "Return to the
 * narrative" point, for every route.
 *
 * Rules:
 *  - Location and chapter screens that belong to the current narrative:
 *    prev/next follow the narrative sequence (see narrative.js).
 *    The first screen's "Previous" goes back to the cover.
 *  - Pages outside the narratives follow the SITE ORDER, which is the order
 *    of the menu: cover → map → about → docs → disclaimer → qr. They also
 *    show "Return to the narrative" if a visit is in progress.
 *  - A location NOT in the current narrative (e.g. opened from the map) sits
 *    after the map in that order: "Previous" shows it on the map, "Next" goes
 *    to the page after the map. A chapter of another narrative, or an unknown
 *    address, sits after the cover in the same way. Both keep "Return to the
 *    narrative".
 *  - So every page has the pair; a link is disabled only where the order
 *    ends (cover: no previous; qr and the last screen of a narrative: no next).
 */
import { getState, setState } from './state.js';
import { sequenceOf, hashFor, indexOfRoute } from './narrative.js';

const SITE_ORDER = ['cover', 'map', 'about', 'docs', 'disclaimer', 'qr'];
const pageHash = (page) => (page === 'cover' ? '#/' : `#/${page}`);
const afterPage = (page) => pageHash(SITE_ORDER[SITE_ORDER.indexOf(page) + 1]);

/** Remember the position in the narrative, so that we can return to it later. */
export function rememberPosition(route) {
  const { narrativeId, lastPosition } = getState();
  const index = indexOfRoute(sequenceOf(narrativeId), route);
  if (index !== -1 && lastPosition[narrativeId] !== index) {
    setState({ lastPosition: { ...lastPosition, [narrativeId]: index } });
  }
}

/** Hash of the screen where the current narrative was left (or its first screen). */
export function resumeHash() {
  const { narrativeId, lastPosition } = getState();
  const sequence = sequenceOf(narrativeId);
  if (!sequence.length) return null;
  const index = Math.min(lastPosition[narrativeId] ?? 0, sequence.length - 1);
  return hashFor(sequence[index]);
}

/**
 * @returns {{prev: string|null, next: string|null, returnTo: string|null,
 *            outside: boolean, position: {current:number, total:number}|null}}
 *   prev/next/returnTo are URL hashes, or null when the link must be disabled/hidden.
 *   outside = true -> this screen is not part of the current narrative.
 */
export function computeNav(route) {
  const { narrativeId, lastPosition } = getState();
  const sequence = sequenceOf(narrativeId);
  const nav = { prev: null, next: null, returnTo: null, outside: false, position: null };

  // Narrative screens
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

  // Pages outside the narratives: the site order
  const p = SITE_ORDER.indexOf(route.page);
  if (p !== -1) {
    nav.prev = p > 0 ? pageHash(SITE_ORDER[p - 1]) : null;
    nav.next = p < SITE_ORDER.length - 1 ? pageHash(SITE_ORDER[p + 1]) : null;
  } else {
    // Unknown address: placed after the cover
    nav.prev = pageHash('cover');
    nav.next = afterPage('cover');
  }
  // The cover has its own Start / Resume buttons
  if (route.page !== 'cover') nav.returnTo = narrativeId in lastPosition ? resumeHash() : null;
  return nav;
}
