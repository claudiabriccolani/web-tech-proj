/**
 * render/about.js — about the author (#/about). Content from data/site.json.
 */
import { el } from '../dom.js';
import { getData } from '../data.js';
import { pageShell } from './page.js';

export function renderAbout(outlet) {
  const { site } = getData();
  outlet.append(
    pageShell({ page: 'about', title: site.about?.title ?? 'About' },
      el('div', { 'data-role': 'about-text', html: site.about?.text ?? '' }),
      el('p', { 'data-role': 'about-author' }, site.author),
    ),
  );
}
