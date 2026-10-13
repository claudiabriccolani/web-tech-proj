import { el } from '../dom.js';

export function pageShell({ page, title, kicker }, ...body) {
  return el('article', { 'data-role': 'page', 'data-page': page },
    el('header', { 'data-role': 'page-header' },
      kicker && el('p', { 'data-role': 'page-kicker' }, kicker),
      el('h1', { 'data-role': 'page-title' }, title)),
    el('div', { 'data-role': 'page-body', 'data-scroll': true }, ...body),
  );
}
