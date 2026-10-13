import { AXES, KEYS } from './textSelector.js';
import { yearOf, videoOf, quizOf } from './data.js';

export function validateData(data) {
  const problems = [];
  const warn = (message) => problems.push(message);

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

    const cited = new Set((loc.citation ?? []).map((c) => c.url));
    (loc['lmml:facts'] ?? []).forEach((fact, f) => {
      if (!fact.text) warn(`${where} facts[${f}]: empty "text"`);
      if (!fact.url) warn(`${where} facts[${f}]: no source "url"`);
      else if (!cited.has(fact.url)) warn(`${where} facts[${f}]: source ${fact.url} is not in "citation"`);
    });
    (loc['lmml:visitorAccess']?.statements ?? []).forEach((statement, v) => {
      if (!statement.url) warn(`${where} visitorAccess[${v}]: no source "url"`);
      else if (!cited.has(statement.url)) warn(`${where} visitorAccess[${v}]: source ${statement.url} is not in "citation"`);
    });
    (loc.image ?? []).forEach((image, m) => {
      if (!image.license || !image.url) warn(`${where} image[${m}]: missing "license" or source "url"`);
      if (!image['lmml:alt']) warn(`${where} image[${m}]: no "lmml:alt" text`);
    });
    const video = videoOf(loc);
    if (video) {
      if (!video.name || !video.url || !video.publisher?.name) warn(`${where} video: missing "name", "url" or "publisher"`);
      if (!String(video.embedUrl ?? '').startsWith('https://www.youtube-nocookie.com/embed/')) {
        warn(`${where} video: "embedUrl" must start with https://www.youtube-nocookie.com/embed/`);
      }
    }
    const quiz = quizOf(loc);
    if (quiz) {
      if (!quiz.name || !quiz.acceptedAnswer?.text) warn(`${where} quiz: missing question ("name") or answer ("acceptedAnswer.text")`);
      if (!(quiz.isBasedOn ?? []).length) warn(`${where} quiz: no source in "isBasedOn"`);
      (quiz.isBasedOn ?? []).forEach((url) => {
        if (!cited.has(url)) warn(`${where} quiz: source ${url} is not in "citation"`);
      });
    }
    checkTexts(loc['lmml:texts'], where, warn);
  });

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
