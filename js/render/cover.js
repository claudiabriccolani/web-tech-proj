/**
 * render/cover.js — the cover page (#/).
 * Title, introductory text, one card per narrative with its explanation
 * and "Start" (and "Resume" if the narrative was already begun).
 */
import { el } from '../dom.js';
import { getData } from '../data.js';
import { getState, setState } from '../state.js';
import { sequenceOf, hashFor } from '../narrative.js';
import { navigate } from '../router.js';
import { pageShell } from './page.js';

export function renderCover(outlet) {
  const { site, narratives } = getData();

  outlet.append(
    pageShell({ page: 'cover', title: site.title, kicker: site.subtitle },
      el('section', { 'data-role': 'cover-intro', html: site.cover?.intro ?? '' }),
      el('section', { 'data-role': 'narrative-list' },
        el('h2', {}, site.cover?.narrativesHeading ?? 'Choose a narrative'),
        el('ul', {}, narratives.map(narrativeCard)),
      ),
    ),
  );
}

function narrativeCard(narrative) {
  const { narrativeId, lastPosition } = getState();
  const id = narrative.identifier;
  const sequence = sequenceOf(id);
  const locationCount = sequence.filter((s) => s.type === 'location').length;
  const canResume = (lastPosition[id] ?? 0) > 0;

  return el('li', { 'data-role': 'narrative-card', 'data-narrative': id, 'data-current': String(id === narrativeId) },
    el('h3', { 'data-role': 'narrative-title' }, narrative.name),
    el('div', { 'data-role': 'narrative-description', html: narrative.description ?? '' }),
    el('p', { 'data-role': 'narrative-meta' },
      `${locationCount} locations · ${(narrative.chapters ?? []).length} chapters`),
    el('div', { 'data-role': 'narrative-actions' },
      el('button', { type: 'button', 'data-role': 'start-button', disabled: !sequence.length, onclick: () => start(id, false) }, 'Start'),
      canResume && el('button', { type: 'button', 'data-role': 'resume-button', onclick: () => start(id, true) }, 'Resume'),
    ),
  );
}

/** Select the narrative and go to its first screen (or where the user left it). */
function start(narrativeId, resume) {
  const sequence = sequenceOf(narrativeId);
  if (!sequence.length) return;
  const index = resume ? Math.min(getState().lastPosition[narrativeId] ?? 0, sequence.length - 1) : 0;
  setState({ narrativeId });
  navigate(hashFor(sequence[index]));
}
