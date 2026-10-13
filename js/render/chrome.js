import { getData } from '../data.js';
import { getState } from '../state.js';
import { computeNav } from '../navigation.js';

const q = (role) => document.querySelector(`[data-role="${role}"]`);

export function initChrome({ onThemeChange, onNarrativeChange }) {
  const { site, narratives } = getData();

  q('site-title').textContent = site.shortTitle ?? site.title;

  const themeSelect = q('theme-switch');
  themeSelect.replaceChildren(...site.themes.map((t) => new Option(t.label, t.id)));
  themeSelect.addEventListener('change', () => onThemeChange(themeSelect.value));

  const narrativeSelect = q('narrative-switch');
  narrativeSelect.replaceChildren(...narratives.map((n) => new Option(n.name, n.identifier)));
  narrativeSelect.addEventListener('change', () => onNarrativeChange(narrativeSelect.value));

  const header = q('site-header');
  const toggle = q('menu-toggle');
  toggle.addEventListener('click', () => {
    const open = header.toggleAttribute('data-menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Arrow keys follow prev/next, unless typing in a form field
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, select, textarea')) return;
    const link = event.key === 'ArrowLeft' ? q('nav-prev') : event.key === 'ArrowRight' ? q('nav-next') : null;
    if (link && !link.hidden && link.hasAttribute('href')) window.location.hash = link.getAttribute('href');
  });
}

export function updateChrome(route) {
  const { site } = getData();
  const state = getState();
  const nav = computeNav(route);

  setLink(q('nav-prev'), nav.prev);
  setLink(q('nav-next'), nav.next);

  const returnLink = q('nav-return');
  returnLink.hidden = !nav.returnTo;
  if (nav.returnTo) returnLink.href = nav.returnTo;

  // The location header already has the return link here, so base.css hides the
  // copy in this bar on narrow viewports
  q('site-footer').dataset.returnInHeader = String(route.name === 'location' && nav.outside && Boolean(nav.returnTo));

  q('nav-position').textContent = nav.position ? `${nav.position.current} / ${nav.position.total}` : '';

  document.querySelectorAll('[data-role="site-menu"] a').forEach((a) => {
    if (a.dataset.page === route.page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // The state can also change from the cover's Start buttons
  q('theme-switch').value = state.theme;
  q('narrative-switch').value = state.narrativeId;

  q('site-header').removeAttribute('data-menu-open');
  q('menu-toggle').setAttribute('aria-expanded', 'false');

  const h1 = document.querySelector('[data-role="view"] h1');
  document.title = h1 && route.page !== 'cover' ? `${h1.textContent} – ${site.title}` : site.title;
}

// Without href the link is not clickable; aria-disabled is what the CSS styles
function setLink(a, href) {
  if (href) {
    a.href = href;
    a.removeAttribute('aria-disabled');
  } else {
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
  }
}
