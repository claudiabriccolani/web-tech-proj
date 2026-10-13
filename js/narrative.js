// A narrative is flattened into the sequence that prev/next walks:
//   chapter 1 [A, B], chapter 2 [C]  ->  [chapter 1] [A] [B] [chapter 2] [C]
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

const cache = new Map();

export function sequenceOf(narrativeId) {
  if (!cache.has(narrativeId)) cache.set(narrativeId, buildSequence(getNarrative(narrativeId)));
  return cache.get(narrativeId);
}

export function hashFor(screen) {
  if (screen.type === 'chapter') {
    return `#/chapter/${encodeURIComponent(screen.narrativeId)}/${screen.chapterIndex + 1}`;
  }
  return `#/location/${encodeURIComponent(screen.locationId)}`;
}

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

export function screenFor(locationId, narrativeId = getState().narrativeId) {
  return sequenceOf(narrativeId).find((s) => s.type === 'location' && s.locationId === locationId) ?? null;
}
