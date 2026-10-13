// Each text sits in a cell of a 3 x 3 x 3 grid (length, level, tone) and only some
// cells exist, so a switch looks for the nearest existing text in its direction.
// No DOM and no state in this file.

export const AXES = Object.freeze({
  length: ['short', 'medium', 'long'],
  level: ['intro', 'average', 'advanced'],
  tone: ['young', 'adult', 'scholar'],
});

export const KEYS = Object.freeze({
  length: 'lmml:length',
  level: 'lmml:level',
  tone: 'lmml:tone',
});

export const DEFAULT_PREF = Object.freeze({ length: 'medium', level: 'average', tone: 'adult' });

// dir +1 moves towards the end of the scale: "Too simple" asks for a higher level
export const SWITCHES = Object.freeze([
  { id: 'more', label: 'Tell me more', short: 'More', axis: 'length', dir: +1 },
  { id: 'less', label: 'Tell me less', short: 'Less', axis: 'length', dir: -1 },
  { id: 'too-simple', label: 'Too simple', short: 'Harder', axis: 'level', dir: +1 },
  { id: 'too-difficult', label: 'Too difficult', short: 'Simpler', axis: 'level', dir: -1 },
  { id: 'play', label: 'Do you want to play?', short: 'Play', axis: 'tone', dir: -1 },
  { id: 'details', label: 'Additional details and references', short: 'Details', axis: 'tone', dir: +1 },
]);

// "short" is the label on phones and says what the button does, so "Too simple" reads "Harder"
export const AXIS_LABELS = Object.freeze({ length: 'Length', level: 'Level', tone: 'Tone' });

const AXIS_NAMES = Object.keys(AXES);

export function rank(text, axis) {
  return AXES[axis].indexOf(text[KEYS[axis]]);
}

function prefRank(pref, axis) {
  const r = AXES[axis].indexOf(pref?.[axis]);
  return r === -1 ? 1 : r;
}

function distance(text, pref, axes) {
  return axes.reduce((sum, axis) => sum + Math.abs(rank(text, axis) - prefRank(pref, axis)), 0);
}

function centrality(text) {
  return AXIS_NAMES.reduce((sum, axis) => sum + Math.abs(rank(text, axis) - 1), 0);
}

// Lowest score wins. Scores are arrays compared in order: [2, 0] < [2, 1] < [3, 0]
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

// Falls back to every text when none exists in that language
export function usableTexts(texts, lang = 'en') {
  const valid = (texts ?? []).filter((t) => AXIS_NAMES.every((axis) => rank(t, axis) !== -1));
  const inLang = valid.filter((t) => (t.inLanguage ?? 'en') === lang);
  return inLang.length ? inLang : valid;
}

export function pickInitial(texts, pref) {
  return best(texts, (t) => [distance(t, pref, AXIS_NAMES), centrality(t)]);
}

// Candidates are the texts strictly beyond the current one on that axis. Among them:
// smallest step first, then closest to the preference on the other two axes, then
// the most central. null means the button is disabled.
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

export function languagesOf(texts) {
  const valid = (texts ?? []).filter((t) => AXIS_NAMES.every((axis) => rank(t, axis) !== -1));
  return [...new Set(valid.map((t) => t.inLanguage ?? 'en'))];
}

export function cellKey(text) {
  return [...AXIS_NAMES.map((axis) => text[KEYS[axis]]), text.inLanguage ?? 'en'].join('|');
}

// A narrative text replaces the default text of the same cell and language
export function mergeTexts(locationTexts, narrativeTexts) {
  const byCell = new Map();
  for (const t of locationTexts ?? []) byCell.set(cellKey(t), { ...t, source: 'location' });
  for (const t of narrativeTexts ?? []) byCell.set(cellKey(t), { ...t, source: 'narrative' });
  return [...byCell.values()];
}

export function cellLabel(text) {
  return AXIS_NAMES.map((axis) => text[KEYS[axis]]).join(' · ');
}
