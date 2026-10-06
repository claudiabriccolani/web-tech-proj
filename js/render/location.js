/**
 * render/location.js — the location page (#/location/:id).
 *
 * Structure (each block is a grid area in base.css; themes can move them):
 *
 *   <article data-role="location" data-active-panel="text">
 *     <header  data-role="location-header">   transition (<details>), kicker, title, work, "not verified"
 *     <nav     data-role="panel-tabs">        Text | Info | QR (narrow viewports only)
 *     <div     data-role="location-content">  wrapper: the scroll container on narrow viewports
 *       <section data-role="location-media">    images with captions (horizontal scroll)
 *       <section data-role="location-text" data-panel="text">   text switches + current text
 *       <section data-role="location-meta" data-panel="info">   metadata table
 *       <section data-role="location-qr"   data-panel="qr">     QR code + map link
 *     </div>
 *     <div     data-role="location-toolbar">  empty on wide viewports (see placeControls)
 *   </article>
 *
 * NARROW VIEWPORTS: the text switches and the map link are MOVED into the
 * toolbar, which CSS keeps at the bottom of the page. This is the one thing
 * CSS cannot do alone (an element cannot leave its parent's box), so
 * placeControls() does it and repeats it whenever the viewport changes.
 *
 * TEXTS: if the location is a step of the current narrative and that step
 * has its own "lmml:texts", each of those REPLACES the location's default text
 * of the same cell and language (see mergeTexts in textSelector.js).
 * If texts exist in more than one language, a language switch is shown.
 */
import { el, externalLink } from '../dom.js';
import { getData, getLocation, getNarrative, textsOf, workOf, workLabel, locationUrl } from '../data.js';
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

/* Same conditions as the "narrow" media query in css/base.css, section 11. */
const NARROW = '(orientation: portrait), (max-width: 600px), (max-height: 500px)';
const LANGUAGE_LABELS = { en: 'English', fr: 'Français', it: 'Italiano' };

export function renderLocation(outlet, params) {
  const loc = getLocation(params.id);
  if (!loc) return renderNotFound(outlet, { path: `/location/${params.id}` });

  // Is this location a step of the current narrative? (null if not)
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
    buildTextPanel(texts),
    el('section', { 'data-role': 'location-meta', 'data-panel': 'info', 'data-scroll': true },
      buildMetadataTable(loc)),
    buildQrPanel(loc),
  );
  const toolbar = el('div', { 'data-role': 'location-toolbar' });

  article.append(buildHeader(loc, screen), buildPanelTabs(article), content, toolbar);
  outlet.append(article);

  // Put the controls where the current viewport wants them, now and on every change
  const narrow = window.matchMedia(NARROW);
  const place = () => placeControls(article, narrow.matches);
  place();
  narrow.addEventListener('change', place);
  return () => narrow.removeEventListener('change', place); // cleanup, called by the router
}

/**
 * Narrow viewport: the text switches and the map link go into the toolbar.
 * Wide viewport: they go back to their panels (switches first in the text
 * panel, map link last in the QR panel). Moving a node keeps its listeners.
 */
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

/* ---------------------------------------------------------------- header */

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

/**
 * Shown when the location is not a step of the current narrative (reached
 * from the map, a QR code or a link): says so and names the narratives that
 * do include it. The footer then offers "Return to the narrative".
 */
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

/**
 * The same message in two lengths. CSS shows the long one on wide screens and
 * the short one where space is tight (see [data-label] in base.css); the one
 * that is not shown is display: none, so it is not read aloud twice.
 */
function twoLabels(long, short) {
  return [el('span', { 'data-label': 'long' }, long), el('span', { 'data-label': 'short' }, short)];
}

/**
 * How to get here from the previous step, as a <details>: the <summary> is a
 * short line built from the data ("28 min · Hammersmith & City line",
 * "13 min · Walk"), the directions open below it. Closed by default, so the
 * directions never take the room of the picture and the text.
 */
function buildTransition(transition) {
  return el('details', { 'data-role': 'transition', 'data-transition-mode': transition.mode ?? '' },
    el('summary', { 'data-role': 'transition-summary' }, transitionSummary(transition)),
    transition.text && el('div', { 'data-role': 'transition-text', html: transition.text }),
  );
}

/** "36 min · Central + Piccadilly lines" / "13 min · Walk" / "Directions" if there is no data. */
function transitionSummary(transition) {
  const lines = (transition.lines ?? []).map((name) => name.replace(/ line$/i, ''));
  const how = lines.length
    ? `${lines.join(' + ')} line${lines.length > 1 ? 's' : ''}`
    : (MODE_LABELS[transition.mode] ?? transition.mode);
  const parts = [transition.minutes != null ? `${transition.minutes} min` : null, how].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Directions';
}

/* ----------------------------------------------------------------- media */

function buildMedia(loc) {
  const images = loc.image ?? [];
  return el('section', { 'data-role': 'location-media', 'data-image-count': images.length },
    images.map((image, i) =>
      el('figure', { 'data-role': 'location-figure', 'data-index': i },
        // alt = what the picture shows (lmml:alt); the caption below says what it is.
        // The caption is only a fallback for images that have no alt text yet.
        el('img', { src: image.contentUrl, alt: image['lmml:alt'] ?? image.caption ?? '', loading: 'lazy' }),
        el('figcaption', { 'data-role': 'figure-caption' },
          el('span', { 'data-role': 'caption-text' }, image.caption),
          buildCredit(image),
          // Says so when no licensed photo of the exact place exists (lmml:imageNote)
          loc['lmml:imageNote'] && el('span', { 'data-role': 'image-note' }, loc['lmml:imageNote']),
        ),
      )),
    // A location with no image at all still shows the note, not an empty box
    !images.length && loc['lmml:imageNote'] && el('p', { 'data-role': 'image-note' }, loc['lmml:imageNote']),
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
 *
 * allTexts = every text of the location (all languages). The six switches
 * only move among the texts of the current language; the language buttons
 * (shown only if there is more than one language) change that language.
 */
function buildTextPanel(allTexts) {
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

  // One group per axis: on phones the two buttons of an axis sit side by
  // side under the name of the axis; on wide screens the groups are
  // display: contents and the six buttons flow as one row.
  const group = (axis, name) => {
    const box = el('div', { 'data-role': 'switch-group', 'data-axis': axis, role: 'group', 'aria-label': name },
      el('span', { 'data-role': 'group-label', 'aria-hidden': 'true' }, name));
    controls.append(box);
    return box;
  };
  const groups = Object.fromEntries(Object.keys(AXIS_LABELS).map((axis) => [axis, group(axis, AXIS_LABELS[axis])]));

  // Create the six buttons once; show() only updates their state.
  // "target" = the text each button would show, or null (button disabled).
  // The accessible name is "short: wording of the assignment", so it always
  // contains whichever label is visible; the tooltip is the full wording.
  const buttons = SWITCHES.map((sw) => {
    const button = el('button', {
      type: 'button', 'data-role': 'text-switch', 'data-switch': sw.id, 'data-axis': sw.axis,
      title: sw.label, 'aria-label': `${sw.short}: ${sw.label}`,
    }, twoLabels(sw.label, sw.short));
    button.addEventListener('click', () => {
      if (!button.target) return;
      // Update the preference on this axis only, so it carries over to the next location
      setState({ textPref: { ...getState().textPref, [sw.axis]: button.target[KEYS[sw.axis]] } });
      show(button.target);
      revealText();
    });
    groups[sw.axis].append(button);
    return { sw, button };
  });

  // Language buttons: one per language, the current one is "pressed"
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
    body.innerHTML = text.text; // trusted HTML from our own data files
    body.lang = text.inLanguage ?? 'en';
    body.dataset.textSource = text.source ?? 'location';
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
    for (const button of languageButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    }
  }

  /**
   * After a switch is pressed, bring the start of the new text into view.
   * On narrow viewports the text scrolls together with the picture inside
   * the content wrapper, so that wrapper is scrolled; on wide ones the text
   * has its own scroll box, already reset by show().
   */
  function revealText() {
    const content = panel.closest('[data-role="location-content"]');
    if (content && content.scrollHeight > content.clientHeight) {
      content.scrollTop = panel.offsetTop - content.offsetTop;
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
    el('a', { 'data-role': 'map-link', href: `#/map/${encodeURIComponent(loc.identifier)}`, 'aria-label': 'Map: show on the map', title: 'Show on the map' },
      twoLabels('Show on the map', 'Map')),
  );
}
