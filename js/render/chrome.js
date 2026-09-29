/**
 * render/chrome.js — the parts of the page that are always there:
 * header (menu, theme switcher, narrative switcher) and footer (prev/next).
 *
 * The HTML of these parts is static in index.html; here we only fill the
 * <select> options, attach event listeners (initChrome, once) and update
 * links after every route change (updateChrome).
 */
import { getData } from '../data.js';
import { getState } from '../state.js';
import { computeNav } from '../navigation.js';

const q = (role) => document.querySelector(`[data-role="${role}"]`);

/**
 * @param {object} handlers
 *   onThemeChange(themeId), onNarrativeChange(narrativeId): called when the user
 *   picks another value in the switchers.
 */
export function initChrome({ onThemeChange, onNarrativeChange }) {
  const { site, narratives } = getData();

  q('site-title').textContent = site.shortTitle ?? site.title;

  // Theme switcher
  const themeSelect = q('theme-switch');
  themeSelect.replaceChildren(...site.themes.map((t) => new Option(t.label, t.id)));
  themeSelect.addEventListener('change', () => onThemeChange(themeSelect.value));

  // Narrative switcher
  const narrativeSelect = q('narrative-switch');
  narrativeSelect.replaceChildren(...narratives.map((n) => new Option(n.name, n.identifier)));
  narrativeSelect.addEventListener('change', () => onNarrativeChange(narrativeSelect.value));

  // Menu button (visible only in portrait, see base.css)
  const header = q('site-header');
  const toggle = q('menu-toggle');
  toggle.addEventListener('click', () => {
    const open = header.toggleAttribute('data-menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Keyboard: left/right arrows follow prev/next (unless typing in a form field)
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, select, textarea')) return;
    const link = event.key === 'ArrowLeft' ? q('nav-prev') : event.key === 'ArrowRight' ? q('nav-next') : null;
    if (link && !link.hidden && link.hasAttribute('href')) window.location.hash = link.getAttribute('href');
  });
}

/** Called after every render: updates prev/next, menu highlight, switchers, title. */
export function updateChrome(route) {
  const { site } = getData();
  const state = getState();
  const nav = computeNav(route);

  // Prev / next: hidden when the screen is outside the narrative, disabled at the ends
  setLink(q('nav-prev'), nav.prev);
  setLink(q('nav-next'), nav.next);
  q('nav-prev').hidden = nav.outside;
  q('nav-next').hidden = nav.outside;

  const returnLink = q('nav-return');
  returnLink.hidden = !nav.returnTo;
  if (nav.returnTo) returnLink.href = nav.returnTo;

  q('nav-position').textContent = nav.position ? `${nav.position.current} / ${nav.position.total}` : '';

  // Highlight the current page in the menu
  document.querySelectorAll('[data-role="site-menu"] a').forEach((a) => {
    if (a.dataset.page === route.page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // Keep switchers in sync (state can also change from the cover's Start buttons)
  q('theme-switch').value = state.theme;
  q('narrative-switch').value = state.narrativeId;

  // Close the portrait menu after navigating
  q('site-header').removeAttribute('data-menu-open');
  q('menu-toggle').setAttribute('aria-expanded', 'false');

  // Browser tab title: "<h1 of the view> – <site title>"
  const h1 = document.querySelector('[data-role="view"] h1');
  document.title = h1 && route.page !== 'cover' ? `${h1.textContent} – ${site.title}` : site.title;
}

/** A link with no href is not clickable; aria-disabled lets CSS style it as disabled. */
function setLink(a, href) {
  if (href) {
    a.href = href;
    a.removeAttribute('aria-disabled');
  } else {
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
  }
}
