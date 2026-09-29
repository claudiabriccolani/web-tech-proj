/**
 * navigation.js — decides where "Previous", "Next" and "Return to the
 * narrative" point, for every route.
 *
 * Rules:
 *  - Location and chapter screens that belong to the current narrative:
 *    prev/next follow the narrative sequence (see narrative.js).
 *    The first screen's "Previous" goes back to the cover.
 *  - A location/chapter NOT in the current narrative (e.g. opened from the
 *    map): no prev/next, only "Return to the narrative".
 *  - Cover: "Next" starts the current narrative.
 *  - Auxiliary pages (map, about, docs, disclaimer, qr) form a small loop of
 *    their own, plus "Return to the narrative" if a visit is in progress.
 */
import { getState, setState } from './state.js';
import { sequenceOf, hashFor, indexOfRoute } from './narrative.js';

const AUX_PAGES = ['map', 'about', 'docs', 'disclaimer', 'qr'];
const auxHash = (page) => `#/${page}`;

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
      return nav;
    }
    nav.prev = i > 0 ? hashFor(sequence[i - 1]) : '#/';
    nav.next = i < sequence.length - 1 ? hashFor(sequence[i + 1]) : null;
    nav.position = { current: i + 1, total: sequence.length };
    return nav;
  }

  // Cover
  if (route.page === 'cover') {
    nav.next = sequence.length ? hashFor(sequence[0]) : null;
    return nav;
  }

  // Auxiliary pages
  const a = AUX_PAGES.indexOf(route.page);
  if (a !== -1) {
    nav.prev = a > 0 ? auxHash(AUX_PAGES[a - 1]) : '#/';
    nav.next = a < AUX_PAGES.length - 1 ? auxHash(AUX_PAGES[a + 1]) : null;
    nav.returnTo = narrativeId in lastPosition ? resumeHash() : null;
  }
  return nav;
}
