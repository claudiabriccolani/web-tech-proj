import { el, externalLink } from '../dom.js';
import { getData, getLocation, getNarrative, textsOf, workOf, workLabel, videoOf, quizOf, locationUrl } from '../data.js';
import { getState, setState } from '../state.js';
import { screenFor } from '../narrative.js';
import { resumeHash } from '../navigation.js';
import { KEYS, SWITCHES, AXIS_LABELS, usableTexts, languagesOf, mergeTexts, pickInitial, findNeighbour, cellLabel } from '../textSelector.js';
import { drawQr } from '../qr.js';
import { buildMetadataTable } from './metadataTable.js';
import { renderNotFound } from './notFound.js';

const PANELS = [
  { id: 'text', label: 'Text' },
  { id: 'info', label: 'Info' },
  { id: 'qr', label: 'QR code' },
];

const MODE_LABELS = { walk: 'Walk', tube: 'Tube', bus: 'Bus' };

const NARROW = '(orientation: portrait), (max-width: 600px), (max-height: 500px)';
const LANGUAGE_LABELS = { en: 'English', fr: 'Français', it: 'Italiano' };

export function renderLocation(outlet, params) {
  const loc = getLocation(params.id);
  if (!loc) return renderNotFound(outlet, { path: `/location/${params.id}` });

  const screen = screenFor(loc.identifier);
  const texts = mergeTexts(textsOf(loc), screen?.step['lmml:texts']);

  const article = el('article', {
    'data-role': 'location',
    'data-location': loc.identifier,
    'data-verified': String(Boolean(loc['lmml:verified'])),
    'data-in-narrative': String(Boolean(screen)),
    'data-active-panel': getState().activePanel,
  });

  const content = el('div', { 'data-role': 'location-content' },
    buildMedia(loc),
    buildTextPanel(texts, buildQuiz(quizOf(loc))),
    el('section', { 'data-role': 'location-meta', 'data-panel': 'info', 'data-scroll': true },
      buildMetadataTable(loc)),
    buildQrPanel(loc),
  );
  const toolbar = el('div', { 'data-role': 'location-toolbar' });

  article.append(buildHeader(loc, screen), buildPanelTabs(article), content, toolbar);
  outlet.append(article);

  const narrow = window.matchMedia(NARROW);
  const place = () => placeControls(article, narrow.matches);
  place();
  narrow.addEventListener('change', place);
  return () => narrow.removeEventListener('change', place);
}

function placeControls(article, isNarrow) {
  const q = (role) => article.querySelector(`[data-role="${role}"]`);
  const controls = q('text-controls');
  const mapLink = q('map-link');
  if (isNarrow) {
    q('location-toolbar').append(...[controls, mapLink].filter(Boolean));
  } else {
    if (controls) q('location-text').prepend(controls);
    if (mapLink) q('location-qr').append(mapLink);
  }
}

function buildHeader(loc, screen) {
  const work = workOf(loc);
  const narrative = screen ? getNarrative(screen.narrativeId) : null;
  const transition = screen?.step['lmml:transition'];

  return el('header', { 'data-role': 'location-header' },
    transition && buildTransition(transition),
    narrative && el('p', { 'data-role': 'location-kicker' },
      `${narrative.name} · Chapter ${screen.chapterIndex + 1}: ${screen.chapter.name}`),
    !screen && buildOutsideNote(loc),
    el('h1', { 'data-role': 'location-title' }, loc.name),
    work && el('p', { 'data-role': 'location-work', 'data-work-type': work['@type'] }, workLabel(work)),
    !loc['lmml:verified'] && el('p', { 'data-role': 'verified-flag' }, twoLabels('Information not yet verified', 'Not verified')),
  );
}

function buildOutsideNote(loc) {
  const current = getNarrative(getState().narrativeId);
  const others = getData().narratives.filter((n) => screenFor(loc.identifier, n.identifier));
  const long = `This location is not part of the narrative “${current?.name ?? ''}”.`
    + (others.length ? ` It is part of: ${others.map((n) => n.name).join(', ')}.` : '');
  const back = resumeHash();
  return el('p', { 'data-role': 'outside-note' },
    twoLabels(long, `Not part of “${current?.name ?? ''}”.`),
    back && ' ',
    back && el('a', { 'data-role': 'outside-return', href: back }, 'Return to the narrative'));
}

function twoLabels(long, short) {
  return [el('span', { 'data-label': 'long' }, long), el('span', { 'data-label': 'short' }, short)];
}

function buildTransition(transition) {
  return el('details', { 'data-role': 'transition', 'data-transition-mode': transition.mode ?? '' },
    el('summary', { 'data-role': 'transition-summary' }, transitionSummary(transition)),
    transition.text && el('div', { 'data-role': 'transition-text', html: transition.text }),
  );
}

function transitionSummary(transition) {
  const lines = (transition.lines ?? []).map((name) => name.replace(/ line$/i, ''));
  const how = lines.length
    ? `${lines.join(' + ')} line${lines.length > 1 ? 's' : ''}`
    : (MODE_LABELS[transition.mode] ?? transition.mode);
  const parts = [transition.minutes != null ? `${transition.minutes} min` : null, how].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Directions';
}

function buildMedia(loc) {
  const images = loc.image ?? [];
  const video = videoOf(loc);
  return el('section', { 'data-role': 'location-media', 'data-image-count': images.length, 'data-has-video': String(Boolean(video)) },
    images.map((image, i) =>
      el('figure', { 'data-role': 'location-figure', 'data-index': i },
        el('img', { src: image.contentUrl, alt: image['lmml:alt'] ?? image.caption ?? '', loading: 'lazy' }),
        el('figcaption', { 'data-role': 'figure-caption' },
          el('span', { 'data-role': 'caption-text' }, image.caption),
          buildCredit(image),
          loc['lmml:imageNote'] && el('span', { 'data-role': 'image-note' }, loc['lmml:imageNote']),
        ),
      )),
    !images.length && loc['lmml:imageNote'] && el('p', { 'data-role': 'image-note' }, loc['lmml:imageNote']),
    video && buildVideo(video),
  );
}

function buildVideo(video) {
  const channel = video.publisher?.name;
  const frame = el('div', { 'data-role': 'video-frame' });
  frame.append(el('button', {
    type: 'button',
    'data-role': 'video-play',
    onclick: () => frame.replaceChildren(el('iframe', {
      src: `${video.embedUrl}?autoplay=1`,
      title: video.name,
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
      referrerpolicy: 'strict-origin-when-cross-origin',
    })),
  }, 'Watch the video'));

  return el('figure', { 'data-role': 'location-figure', 'data-kind': 'video' },
    frame,
    el('figcaption', { 'data-role': 'figure-caption' },
      el('span', { 'data-role': 'caption-text' }, video.name),
      el('span', { 'data-role': 'caption-credit' },
        channel && `Video: ${channel}, official channel on YouTube · `,
        externalLink(video.url, 'Watch on YouTube')),
    ),
  );
}

function buildCredit(image) {
  const parts = [];
  if (image.creditText) parts.push(`Credit: ${image.creditText}`);
  if (image.license) parts.push(/^https?:/.test(image.license) ? externalLink(image.license, 'License') : image.license);
  if (image.url) parts.push(externalLink(image.url, 'Source'));
  if (!parts.length) return null;

  return el('span', { 'data-role': 'caption-credit' }, parts.flatMap((p, i) => (i ? [' · ', p] : [p])));
}

function buildPanelTabs(article) {
  const nav = el('nav', { 'data-role': 'panel-tabs', 'aria-label': 'Location sections' });

  for (const panel of PANELS) {
    nav.append(el('button', {
      type: 'button',
      'data-panel-target': panel.id,
      'aria-pressed': String(article.dataset.activePanel === panel.id),
      onclick: () => {
        article.dataset.activePanel = panel.id;
        setState({ activePanel: panel.id });
        nav.querySelectorAll('button').forEach((b) =>
          b.setAttribute('aria-pressed', String(b.dataset.panelTarget === panel.id)));
      },
    }, panel.label));
  }
  return nav;
}

function buildTextPanel(allTexts, quiz) {
  const panel = el('section', { 'data-role': 'location-text', 'data-panel': 'text' });
  const controls = el('div', { 'data-role': 'text-controls' });
  const cell = el('p', { 'data-role': 'text-cell' });
  const body = el('div', { 'data-role': 'text-body', 'data-scroll': true });
  panel.append(controls, cell, body);

  const languages = languagesOf(allTexts);
  let lang = languages.includes(getState().lang) ? getState().lang : (languages[0] ?? 'en');
  let texts = usableTexts(allTexts, lang);

  if (!texts.length) {
    body.append(el('p', { 'data-role': 'text-empty' }, 'No text is available for this location yet.'));
    return panel;
  }

  const group = (axis, name) => {
    const box = el('div', { 'data-role': 'switch-group', 'data-axis': axis, role: 'group', 'aria-label': name },
      el('span', { 'data-role': 'group-label', 'aria-hidden': 'true' }, name));
    controls.append(box);
    return box;
  };
  const groups = Object.fromEntries(Object.keys(AXIS_LABELS).map((axis) => [axis, group(axis, AXIS_LABELS[axis])]));

  const buttons = SWITCHES.map((sw) => {
    const button = el('button', {
      type: 'button', 'data-role': 'text-switch', 'data-switch': sw.id, 'data-axis': sw.axis,
      title: sw.label, 'aria-label': `${sw.short}: ${sw.label}`,
    }, twoLabels(sw.label, sw.short));
    button.addEventListener('click', () => {
      if (!button.target) return;
      setState({ textPref: { ...getState().textPref, [sw.axis]: button.target[KEYS[sw.axis]] } });
      show(button.target);
      revealText();
    });
    groups[sw.axis].append(button);
    return { sw, button };
  });

  const languageGroup = languages.length > 1 ? group('language', 'Language') : null;
  const languageButtons = languages.length > 1
    ? languages.map((code) => {
      const button = el('button', { type: 'button', 'data-role': 'lang-switch', 'data-lang': code, lang: code },
        LANGUAGE_LABELS[code] ?? code);
      button.addEventListener('click', () => {
        lang = code;
        setState({ lang });
        texts = usableTexts(allTexts, lang);
        show(pickInitial(texts, getState().textPref));
        revealText();
      });
      languageGroup.append(button);
      return button;
    })
    : [];

  function show(text) {
    body.innerHTML = text.text; 
    body.lang = text.inLanguage ?? 'en';
    body.dataset.textSource = text.source ?? 'location';
    body.dataset.textLength = text[KEYS.length];
    body.dataset.textLevel = text[KEYS.level];
    body.dataset.textTone = text[KEYS.tone];
    body.scrollTop = 0;
    cell.textContent = cellLabel(text);

    if (quiz) {
      quiz.open = false;
      if (text[KEYS.tone] === 'young') body.append(quiz);
    }

    const pref = getState().textPref;
    for (const { sw, button } of buttons) {
      button.target = findNeighbour(texts, text, sw.axis, sw.dir, pref);
      button.disabled = !button.target;
    }
    for (const button of languageButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    }
  }

  function revealText() {
    const content = panel.closest('[data-role="location-content"]');
    if (content && content.scrollHeight > content.clientHeight) {
      content.scrollTop = panel.offsetTop - content.offsetTop;
    }
  }

  show(pickInitial(texts, getState().textPref));
  return panel;
}

function buildQuiz(quiz) {
  if (!quiz?.name || !quiz.acceptedAnswer?.text) return null;
  const details = el('details', { 'data-role': 'quiz', lang: quiz.inLanguage ?? 'en' },
    el('summary', { 'data-role': 'quiz-question' },
      el('span', { 'data-role': 'quiz-label' }, 'Spot the shot'), ' ', quiz.name),
    el('p', { 'data-role': 'quiz-answer' }, quiz.acceptedAnswer.text),
  );
  details.addEventListener('toggle', () => {
    if (details.open) details.scrollIntoView({ block: 'nearest' });
  });
  return details;
}

function buildQrPanel(loc) {
  const url = locationUrl(loc.identifier);
  const code = el('div', { 'data-role': 'qr-code' });
  drawQr(code, url, 128, `QR code for ${loc.name}`);

  return el('section', { 'data-role': 'location-qr', 'data-panel': 'qr' },
    code,
    el('p', { 'data-role': 'qr-url' }, url),
    el('a', { 'data-role': 'map-link', href: `#/map/${encodeURIComponent(loc.identifier)}`, 'aria-label': 'Map: show on the map', title: 'Show on the map' },
      twoLabels('Show on the map', 'Map')),
  );
}
