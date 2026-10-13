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
    // the app still works, it just won't remember
  }
}

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

export function setState(patch) {
  state = { ...state, ...patch };
  writeStorage();
}
