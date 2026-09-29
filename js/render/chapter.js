/**
 * render/chapter.js — a chapter intro screen (#/chapter/:narrativeId/:n).
 * These screens sit between locations in the narrative sequence.
 */
import { el } from '../dom.js';
import { getNarrative, getLocation, workOf, workLabel } from '../data.js';
import { pageShell } from './page.js';
import { renderNotFound } from './notFound.js';

export function renderChapter(outlet, params) {
  const narrative = getNarrative(params.narrativeId);
  const chapterIndex = Number(params.n) - 1;
  const chapter = narrative?.chapters?.[chapterIndex];
  if (!chapter) return renderNotFound(outlet, { path: `/chapter/${params.narrativeId}/${params.n}` });

  const total = narrative.chapters.length;
  const locations = (chapter.steps ?? []).map((step) => getLocation(step.locationId)).filter(Boolean);

  const page = pageShell(
    { page: 'chapter', title: chapter.name, kicker: `${narrative.name} · Chapter ${chapterIndex + 1} of ${total}` },
    el('div', { 'data-role': 'chapter-intro', html: chapter.text ?? '' }),
    el('section', { 'data-role': 'chapter-steps' },
      el('h2', {}, 'In this chapter'),
      el('ol', {}, locations.map((loc) =>
        el('li', {},
          el('a', { href: `#/location/${encodeURIComponent(loc.identifier)}` }, loc.name),
          ' — ',
          el('span', { 'data-role': 'location-work' }, workLabel(workOf(loc))),
        ))),
    ),
  );
  page.dataset.chapter = String(chapterIndex + 1);
  page.dataset.narrative = narrative.identifier;
  outlet.append(page);
}
