/**
 * validate.js — checks the data at startup and reports problems in the
 * browser console (F12). It never blocks the app: it only warns.
 *
 * Useful when adding content by hand: a typo in a locationId or in a text's
 * "lmml:length" shows up here immediately.
 */
import { AXES, KEYS } from './textSelector.js';
import { yearOf } from './data.js';

export function validateData(data) {
  const problems = [];
  const warn = (message) => problems.push(message);

  /* ---- Locations ---- */
  const seenIds = new Set();
  data.locations.forEach((loc, i) => {
    const where = `locations[${i}] "${loc.identifier ?? '?'}"`;

    if (!loc.identifier) warn(`${where}: missing "identifier"`);
    else if (seenIds.has(loc.identifier)) warn(`${where}: duplicate identifier`);
    seenIds.add(loc.identifier);

    if (!loc.name) warn(`${where}: missing "name"`);
    if (typeof loc.geo?.latitude !== 'number' || typeof loc.geo?.longitude !== 'number') {
      warn(`${where}: "geo" needs numeric latitude and longitude`);
    }
    if (loc['lmml:cameraPosition'] && typeof loc['lmml:cameraBearing'] !== 'number') {
      warn(`${where}: has "lmml:cameraPosition" but no numeric "lmml:cameraBearing"`);
    }
    if (!loc['lmml:appearsIn']) warn(`${where}: missing "lmml:appearsIn"`);
    if (!(loc['lmml:texts'] ?? []).length) warn(`${where}: no texts`);
    checkTexts(loc['lmml:texts'], where, warn);
  });

  /* ---- Narratives ---- */
  data.narratives.forEach((narrative) => {
    const inNarrative = new Set();
    const dates = [];

    (narrative.chapters ?? []).forEach((chapter, ci) => {
      (chapter.steps ?? []).forEach((step, si) => {
        const where = `narrative "${narrative.identifier}", chapter ${ci + 1}, step ${si + 1}`;
        const loc = data.locationsById.get(step.locationId);

        if (!loc) warn(`${where}: unknown locationId "${step.locationId}"`);
        if (inNarrative.has(step.locationId)) warn(`${where}: "${step.locationId}" appears twice in this narrative`);
        inNarrative.add(step.locationId);
        if (step['lmml:texts']) checkTexts(step['lmml:texts'], where, warn);

        if (loc) dates.push({ id: loc.identifier, year: yearOf(loc['lmml:appearsIn']?.datePublished) });
      });
    });

    // A narrative that declares "lmml:orderedBy": "datePublished" must really be in date order.
    if (narrative['lmml:orderedBy'] === 'datePublished') {
      for (let i = 1; i < dates.length; i++) {
        if (dates[i].year < dates[i - 1].year) {
          warn(`narrative "${narrative.identifier}": "${dates[i].id}" (${dates[i].year}) comes after "${dates[i - 1].id}" (${dates[i - 1].year})`);
        }
      }
    }
  });

  if (problems.length) {
    console.group(`LMML data check: ${problems.length} problem(s)`);
    problems.forEach((p) => console.warn(p));
    console.groupEnd();
  } else {
    console.info('LMML data check: OK');
  }
  return problems;
}

function checkTexts(texts = [], where, warn) {
  const cells = new Set();
  texts.forEach((text, i) => {
    for (const axis of Object.keys(AXES)) {
      const value = text[KEYS[axis]];
      if (!AXES[axis].includes(value)) {
        warn(`${where} texts[${i}]: "${KEYS[axis]}" is "${value}", expected one of ${AXES[axis].join(' | ')}`);
      }
    }
    if (!text.text) warn(`${where} texts[${i}]: empty "text"`);

    const cell = [text[KEYS.length], text[KEYS.level], text[KEYS.tone], text.inLanguage ?? 'en'].join('|');
    if (cells.has(cell)) warn(`${where} texts[${i}]: two texts in the same cell (${cell})`);
    cells.add(cell);
  });
}
