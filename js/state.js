/**
 * state.js — the user's choices, saved in localStorage.
 *
 * What we remember:
 *   theme        id of the current theme ("victorian", "sixties")
 *   narrativeId  id of the current narrative
 *   textPref     {length, level, tone} — the preferred text cell (see textSelector.js)
 *   lastPosition {narrativeId: index} — last screen visited in each narrative,
 *                used by "Resume" and "Return to the narrative"
 *   activePanel  which panel (text / info / qr) is open on location pages in portrait
 *   lang         preferred language of the texts ('en', 'fr'); used when a text exists in it
 *
 * It's a deliberately simple store: getState() to read, setState(patch) to
 * change (and save). Whoever changes the state is responsible for
 * re-rendering if needed — there is no hidden automatic update.
 */
import { AXES, DEFAULT_PREF } from './textSelector.js';

const STORAGE_KEY = 'lmml-state-v1';
const PANELS = ['text', 'info', 'qr'];

let state = {
  theme: null,
  narrativeId: null,
  textPref: { ...DEFAULT_PREF },
  lastPosition: {},
  activePanel: 'text',
  lang: 'en',
};

/* localStorage can throw (private mode, blocked storage): never let it break the app. */
function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function writeStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: the app still works, it just won't remember */
  }
}

/**
 * Merge saved values with defaults. Saved values are checked against what
 * exists NOW (a theme or narrative may have been renamed or removed since).
 */
export function initState({ themeIds, defaultTheme, narrativeIds, defaultNarrative }) {
  const saved = readStorage();

  const textPref = { ...DEFAULT_PREF };
  for (const axis of Object.keys(AXES)) {
    if (AXES[axis].includes(saved.textPref?.[axis])) textPref[axis] = saved.textPref[axis];
  }

  state = {
    theme: themeIds.includes(saved.theme) ? saved.theme : defaultTheme,
    narrativeId: narrativeIds.includes(saved.narrativeId) ? saved.narrativeId : defaultNarrative,
    textPref,
    lastPosition: saved.lastPosition && typeof saved.lastPosition === 'object' ? saved.lastPosition : {},
    activePanel: PANELS.includes(saved.activePanel) ? saved.activePanel : 'text',
    lang: typeof saved.lang === 'string' ? saved.lang : 'en',
  };
  writeStorage();
}

export function getState() {
  return state;
}

/** Shallow-merge a patch into the state and save it: setState({ theme: 'sixties' }) */
export function setState(patch) {
  state = { ...state, ...patch };
  writeStorage();
}
