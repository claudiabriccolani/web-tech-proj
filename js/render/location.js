/**
 * render/location.js — the location page (#/location/:id).
 *
 * Structure (each block is a grid area in base.css; themes can move them):
 *
 *   <article data-role="location" data-active-panel="text">
 *     <header  data-role="location-header">   transition, kicker, title, work, "not verified"
 *     <section data-role="location-media">    images with captions (horizontal scroll)
 *     <nav     data-role="panel-tabs">        Text | Info | QR (portrait only)
 *     <section data-role="location-text" data-panel="text">   text switches + current text
 *     <section data-role="location-meta" data-panel="info">   metadata table
 *     <section data-role="location-qr"   data-panel="qr">     QR code
 *   </article>
 *
 * TEXTS: if the location is a step of the current narrative and that step
 * has its own "lmml:texts", those REPLACE the location's default texts.
 */
import { el, externalLink } from '../dom.js';
import { getLocation, getNarrative, textsOf, workOf, workLabel, locationUrl } from '../data.js';
import { getState, setState } from '../state.js';
import { screenFor } from '../narrative.js';
import { KEYS, SWITCHES, usableTexts, pickInitial, findNeighbour, cellLabel } from '../textSelector.js';
import { drawQr } from '../qr.js';
import { buildMetadataTable } from './metadataTable.js';
import { renderNotFound } from './notFound.js';

const PANELS = [
  { id: 'text', label: 'Text' },
  { id: 'info', label: 'Info' },
  { id: 'qr', label: 'QR code' },
];

const MODE_LABELS = { walk: 'Walk', tube: 'Tube', bus: 'Bus' };

export function renderLocation(outlet, params) {
  const loc = getLocation(params.id);
  if (!loc) return renderNotFound(outlet, { path: `/location/${params.id}` });

  // Is this location a step of the current narrative? (null if not)
  const screen = screenFor(loc.identifier);
  const narrativeTexts = screen?.step['lmml:texts'];
  const useNarrativeTexts = Array.isArray(narrativeTexts) && narrativeTexts.length > 0;
  const texts = usableTexts(useNarrativeTexts ? narrativeTexts : textsOf(loc));

  const article = el('article', {
    'data-role': 'location',
    'data-location': loc.identifier,
    'data-verified': String(Boolean(loc['lmml:verified'])),
    'data-in-narrative': String(Boolean(screen)),
    'data-active-panel': getState().activePanel,
  });

  article.append(
    buildHeader(loc, screen),
    buildMedia(loc),
    buildPanelTabs(article),
    buildTextPanel(texts, useNarrativeTexts ? 'narrative' : 'location'),
    el('section', { 'data-role': 'location-meta', 'data-panel': 'info', 'data-scroll': true },
      buildMetadataTable(loc)),
    buildQrPanel(loc),
  );
  outlet.append(article);
}

/* ---------------------------------------------------------------- header */

function buildHeader(loc, screen) {
  const work = workOf(loc);
  const narrative = screen ? getNarrative(screen.narrativeId) : null;
  const transition = screen?.step['lmml:transition'];

  return el('header', { 'data-role': 'location-header' },
    transition && buildTransition(transition),
    narrative && el('p', { 'data-role': 'location-kicker' },
      `${narrative.name} · Chapter ${screen.chapterIndex + 1}: ${screen.chapter.name}`),
    el('h1', { 'data-role': 'location-title' }, loc.name),
    work && el('p', { 'data-role': 'location-work', 'data-work-type': work['@type'] }, workLabel(work)),
    !loc['lmml:verified'] && el('p', { 'data-role': 'verified-flag' }, 'Information not yet verified'),
  );
}

/** How to get here from the previous step: "Tube · approx. 20 min" + directions text. */
function buildTransition(transition) {
  const summary = [
    MODE_LABELS[transition.mode] ?? transition.mode,
    transition.minutes != null ? `approx. ${transition.minutes} min` : null,
  ].filter(Boolean).join(' · ');

  return el('section', { 'data-role': 'transition', 'data-transition-mode': transition.mode ?? '' },
    summary && el('p', { 'data-role': 'transition-summary' }, summary),
    transition.text && el('div', { 'data-role': 'transition-text', html: transition.text }),
  );
}

/* ----------------------------------------------------------------- media */

function buildMedia(loc) {
  const images = loc.image ?? [];
  return el('section', { 'data-role': 'location-media', 'data-image-count': images.length },
    images.map((image, i) =>
      el('figure', { 'data-role': 'location-figure', 'data-index': i },
        el('img', { src: image.contentUrl, alt: image.caption ?? '', loading: 'lazy' }),
        el('figcaption', { 'data-role': 'figure-caption' },
          el('span', { 'data-role': 'caption-text' }, image.caption),
          buildCredit(image),
        ),
      )),
  );
}

/** "Credit: X · License · Source" (links only when the value is a URL). */
function buildCredit(image) {
  const parts = [];
  if (image.creditText) parts.push(`Credit: ${image.creditText}`);
  if (image.license) parts.push(/^https?:/.test(image.license) ? externalLink(image.license, 'License') : image.license);
  if (image.url) parts.push(externalLink(image.url, 'Source'));
  if (!parts.length) return null;

  // interleave " · " between parts
  return el('span', { 'data-role': 'caption-credit' }, parts.flatMap((p, i) => (i ? [' · ', p] : [p])));
}

/* ------------------------------------------------------------ panel tabs */

/**
 * In portrait only one panel is visible at a time: the tabs set
 * data-active-panel on the article and CSS hides the others.
 * In landscape the tabs are hidden and all panels are visible.
 */
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

/* ------------------------------------------------------------ text panel */

/**
 * The text and its six switches. Only this panel is updated when a switch
 * is pressed: the rest of the page is not re-rendered.
 */
function buildTextPanel(texts, source) {
  const panel = el('section', { 'data-role': 'location-text', 'data-panel': 'text' });
  const controls = el('div', { 'data-role': 'text-controls' });
  const cell = el('p', { 'data-role': 'text-cell' });
  const body = el('div', { 'data-role': 'text-body', 'data-scroll': true, 'data-text-source': source });
  panel.append(controls, cell, body);

  if (!texts.length) {
    body.append(el('p', { 'data-role': 'text-empty' }, 'No text is available for this location yet.'));
    return panel;
  }

  // Create the six buttons once; show() only updates their state.
  // "target" = the text each button would show, or null (button disabled).
  const buttons = SWITCHES.map((sw) => {
    const button = el('button', { type: 'button', 'data-role': 'text-switch', 'data-switch': sw.id, 'data-axis': sw.axis }, sw.label);
    button.addEventListener('click', () => {
      if (!button.target) return;
      // Update the preference on this axis only, so it carries over to the next location
      setState({ textPref: { ...getState().textPref, [sw.axis]: button.target[KEYS[sw.axis]] } });
      show(button.target);
    });
    controls.append(button);
    return { sw, button };
  });

  function show(text) {
    body.innerHTML = text.text; // trusted HTML from our own data files
    body.lang = text.inLanguage ?? 'en';
    body.dataset.textLength = text[KEYS.length];
    body.dataset.textLevel = text[KEYS.level];
    body.dataset.textTone = text[KEYS.tone];
    body.scrollTop = 0;
    cell.textContent = cellLabel(text);

    const pref = getState().textPref;
    for (const { sw, button } of buttons) {
      button.target = findNeighbour(texts, text, sw.axis, sw.dir, pref);
      button.disabled = !button.target;
    }
  }

  show(pickInitial(texts, getState().textPref));
  return panel;
}

/* -------------------------------------------------------------- QR panel */

function buildQrPanel(loc) {
  const url = locationUrl(loc.identifier);
  const code = el('div', { 'data-role': 'qr-code' });
  drawQr(code, url, 128);

  return el('section', { 'data-role': 'location-qr', 'data-panel': 'qr' },
    code,
    el('p', { 'data-role': 'qr-url' }, url),
    el('a', { 'data-role': 'map-link', href: `#/map/${encodeURIComponent(loc.identifier)}` }, 'Show on the map'),
  );
}
