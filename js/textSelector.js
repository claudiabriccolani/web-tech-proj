/**
 * textSelector.js — chooses which text of a location to show.
 *
 * THE MODEL
 * Every text sits in a cell of a 3-dimensional grid. Each dimension ("axis")
 * is an ORDERED scale of three values:
 *
 *   length : short  < medium  < long
 *   level  : intro  < average < advanced
 *   tone   : young  < adult   < scholar
 *
 * Only some cells exist (3–9 per location, not all 27), so we can't simply
 * "go to the next cell": it may not exist. Instead we look for the NEAREST
 * existing text in the requested direction.
 *
 * THE PREFERENCE
 * The user's preference {length, level, tone} is stored in state.js and
 * carries over from one location to the next. It records what the user asked
 * for, which may differ from the text actually shown (if that exact cell is
 * missing).
 *
 * This module is PURE: no DOM, no state. It receives data and returns data,
 * which makes it easy to test and to explain.
 */

export const AXES = Object.freeze({
  length: ['short', 'medium', 'long'],
  level: ['intro', 'average', 'advanced'],
  tone: ['young', 'adult', 'scholar'],
});

/** Property name of each axis in the JSON data. */
export const KEYS = Object.freeze({
  length: 'lmml:length',
  level: 'lmml:level',
  tone: 'lmml:tone',
});

export const DEFAULT_PREF = Object.freeze({ length: 'medium', level: 'average', tone: 'adult' });

/**
 * The six buttons. Each one moves ONE step along ONE axis.
 * dir +1 = towards the end of the scale, -1 = towards the start.
 *   "Too simple"    -> I want a HIGHER level   (+1)
 *   "Too difficult" -> I want a LOWER level    (-1)
 *   "Do you want to play?"               -> towards "young"   (-1)
 *   "Additional details and references"  -> towards "scholar" (+1)
 */
export const SWITCHES = Object.freeze([
  { id: 'more', label: 'Tell me more', short: 'More', axis: 'length', dir: +1 },
  { id: 'less', label: 'Tell me less', short: 'Less', axis: 'length', dir: -1 },
  { id: 'too-simple', label: 'Too simple', short: 'Harder', axis: 'level', dir: +1 },
  { id: 'too-difficult', label: 'Too difficult', short: 'Simpler', axis: 'level', dir: -1 },
  { id: 'play', label: 'Do you want to play?', short: 'Play', axis: 'tone', dir: -1 },
  { id: 'details', label: 'Additional details and references', short: 'Details', axis: 'tone', dir: +1 },
]);

/**
 * "label" is the wording of the assignment and is what wide screens show.
 * "short" is what the phone toolbar shows, where the two buttons of an axis
 * sit side by side under the name of the axis. A short label says what the
 * button DOES: "Too simple" asks for a harder text, so its short label is
 * "Harder" (and "Too difficult" becomes "Simpler").
 */
export const AXIS_LABELS = Object.freeze({ length: 'Length', level: 'Level', tone: 'Tone' });

const AXIS_NAMES = Object.keys(AXES);

/** Position (0, 1, 2) of a text on an axis; -1 if the value is invalid. */
export function rank(text, axis) {
  return AXES[axis].indexOf(text[KEYS[axis]]);
}

/** Position of the preference on an axis (invalid values count as the middle). */
function prefRank(pref, axis) {
  const r = AXES[axis].indexOf(pref?.[axis]);
  return r === -1 ? 1 : r;
}

/** How far a text is from the preference, summed over the given axes. */
function distance(text, pref, axes) {
  return axes.reduce((sum, axis) => sum + Math.abs(rank(text, axis) - prefRank(pref, axis)), 0);
}

/** Tie-breaker: prefer texts closer to the middle (medium, average, adult). */
function centrality(text) {
  return AXIS_NAMES.reduce((sum, axis) => sum + Math.abs(rank(text, axis) - 1), 0);
}

/**
 * Return the item with the LOWEST score. Scores are arrays compared
 * lexicographically: [2, 0] < [2, 1] < [3, 0]. The first number is the most
 * important criterion, the next ones only break ties.
 */
function best(items, scoreOf) {
  let bestItem = null;
  let bestScore = null;
  for (const item of items) {
    const score = scoreOf(item);
    if (bestScore === null || compareScores(score, bestScore) < 0) {
      bestItem = item;
      bestScore = score;
    }
  }
  return bestItem;
}

function compareScores(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/**
 * Keep only texts with valid axis values, in the requested language.
 * If no text exists in that language, fall back to all texts rather than showing nothing.
 */
export function usableTexts(texts, lang = 'en') {
  const valid = (texts ?? []).filter((t) => AXIS_NAMES.every((axis) => rank(t, axis) !== -1));
  const inLang = valid.filter((t) => (t.inLanguage ?? 'en') === lang);
  return inLang.length ? inLang : valid;
}

/**
 * First text shown when a location opens: the one closest to the preference.
 * If the exact cell exists, its distance is 0 and it wins.
 */
export function pickInitial(texts, pref) {
  return best(texts, (t) => [distance(t, pref, AXIS_NAMES), centrality(t)]);
}

/**
 * The text reached by pressing a button, or null if there is none
 * (null = the button must be disabled).
 *
 * 1. Candidates: texts strictly beyond the current one in the requested
 *    direction on that axis (e.g. "Tell me more": longer than now).
 * 2. Among them, prefer:
 *    a) the smallest step on that axis (medium before long),
 *    b) then the closest to the preference on the OTHER two axes
 *       (don't change level/tone more than needed),
 *    c) then the most "central" text.
 */
export function findNeighbour(texts, current, axis, dir, pref) {
  const from = rank(current, axis);
  const otherAxes = AXIS_NAMES.filter((a) => a !== axis);
  const candidates = texts.filter((t) => (rank(t, axis) - from) * dir > 0);

  return best(candidates, (t) => [
    Math.abs(rank(t, axis) - from),
    distance(t, pref, otherAxes),
    centrality(t),
  ]);
}

/** The languages that have at least one valid text, in order of first appearance: ['en', 'fr']. */
export function languagesOf(texts) {
  const valid = (texts ?? []).filter((t) => AXIS_NAMES.every((axis) => rank(t, axis) !== -1));
  return [...new Set(valid.map((t) => t.inLanguage ?? 'en'))];
}

/** A text's cell and language as one string, e.g. "short|intro|young|fr". */
export function cellKey(text) {
  return [...AXIS_NAMES.map((axis) => text[KEYS[axis]]), text.inLanguage ?? 'en'].join('|');
}

/**
 * Combine a location's default texts with the texts of a narrative step.
 * A narrative text REPLACES the default text of the same cell and language;
 * all other default texts are kept, so the switches still have somewhere to go.
 * Each returned text is a copy with a "source" property: 'location' or 'narrative'.
 */
export function mergeTexts(locationTexts, narrativeTexts) {
  const byCell = new Map();
  for (const t of locationTexts ?? []) byCell.set(cellKey(t), { ...t, source: 'location' });
  for (const t of narrativeTexts ?? []) byCell.set(cellKey(t), { ...t, source: 'narrative' });
  return [...byCell.values()];
}

/** Human-readable name of a text's cell: "short · intro · adult". */
export function cellLabel(text) {
  return AXIS_NAMES.map((axis) => text[KEYS[axis]]).join(' · ');
}
