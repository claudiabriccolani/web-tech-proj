/**
 * render/notFound.js — shown for unknown hashes or unknown ids.
 */
import { el } from '../dom.js';
import { pageShell } from './page.js';

export function renderNotFound(outlet, params = {}) {
  outlet.dataset.view = 'not-found';
  outlet.replaceChildren(
    pageShell({ page: 'not-found', title: 'Page not found' },
      el('p', {}, `There is nothing at “${params.path ?? ''}”.`),
      el('p', {}, el('a', { href: '#/' }, 'Back to the cover')),
    ),
  );
}
