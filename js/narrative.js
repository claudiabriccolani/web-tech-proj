/**
 * narrative.js — turns a narrative (chapters → steps) into a flat SEQUENCE
 * of screens, which is what prev/next navigation needs.
 *
 *   narrative:  chapter 1 [A, B]   chapter 2 [C]
 *   sequence:   [chapter 1] [A] [B] [chapter 2] [C]
 *                   0        1   2       3       4
 *
 * Each screen is one of:
 *   { type: 'chapter',  narrativeId, chapterIndex, chapter }
 *   { type: 'location', narrativeId, chapterIndex, chapter, stepIndex, step, locationId }
 *
 * Chapter intros are therefore real screens between locations, with their
 * own route: #/chapter/<narrativeId>/<chapter number, from 1>.
 */
import { getNarrative } from './data.js';
import { getState } from './state.js';

export function buildSequence(narrative) {
  const screens = [];
  if (!narrative) return screens;
  const narrativeId = narrative.identifier;

  (narrative.chapters ?? []).forEach((chapter, chapterIndex) => {
    screens.push({ type: 'chapter', narrativeId, chapterIndex, chapter });

    (chapter.steps ?? []).forEach((step, stepIndex) => {
      screens.push({
        type: 'location',
        narrativeId,
        chapterIndex,
        chapter,
        stepIndex,
        step,
        locationId: step.locationId,
      });
    });
  });
  return screens;
}

/* The data never changes while the app runs, so each sequence is built once. */
const cache = new Map();

export function sequenceOf(narrativeId) {
  if (!cache.has(narrativeId)) cache.set(narrativeId, buildSequence(getNarrative(narrativeId)));
  return cache.get(narrativeId);
}

/** The URL hash of a screen. */
export function hashFor(screen) {
  if (screen.type === 'chapter') {
    return `#/chapter/${encodeURIComponent(screen.narrativeId)}/${screen.chapterIndex + 1}`;
  }
  return `#/location/${encodeURIComponent(screen.locationId)}`;
}

/** Index of the current route in a sequence, or -1 if the route isn't part of it. */
export function indexOfRoute(sequence, route) {
  if (route.name === 'location') {
    return sequence.findIndex((s) => s.type === 'location' && s.locationId === route.params.id);
  }
  if (route.name === 'chapter') {
    const chapterIndex = Number(route.params.n) - 1;
    return sequence.findIndex(
      (s) => s.type === 'chapter' && s.narrativeId === route.params.narrativeId && s.chapterIndex === chapterIndex,
    );
  }
  return -1;
}

/**
 * The screen of a location in the CURRENT narrative (step, chapter, …),
 * or null if the location is not part of it (e.g. reached from the map).
 */
export function screenFor(locationId, narrativeId = getState().narrativeId) {
  return sequenceOf(narrativeId).find((s) => s.type === 'location' && s.locationId === locationId) ?? null;
}
