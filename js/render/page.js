/**
 * render/page.js — the common skeleton of "text pages" (cover, chapter,
 * about, docs, disclaimer, qr, not found):
 *
 *   <article data-role="page" data-page="about">
 *     <header data-role="page-header">
 *       <p data-role="page-kicker">…</p>      (optional small line above the title)
 *       <h1 data-role="page-title">…</h1>
 *     </header>
 *     <div data-role="page-body" data-scroll>…</div>   <- scrolls on its own
 *   </article>
 */
import { el } from '../dom.js';

export function pageShell({ page, title, kicker }, ...body) {
  return el('article', { 'data-role': 'page', 'data-page': page },
    el('header', { 'data-role': 'page-header' },
      kicker && el('p', { 'data-role': 'page-kicker' }, kicker),
      el('h1', { 'data-role': 'page-title' }, title)),
    el('div', { 'data-role': 'page-body', 'data-scroll': true }, ...body),
  );
}
