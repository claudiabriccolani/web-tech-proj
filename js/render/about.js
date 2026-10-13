import { el } from '../dom.js';
import { getData } from '../data.js';
import { pageShell } from './page.js';

export function renderAbout(outlet) {
  const { site } = getData();
  outlet.append(
    pageShell({ page: 'about', title: site.about?.title ?? 'About' },
      el('p', { 'data-role': 'about-author' }, site.author),
      el('div', { 'data-role': 'about-text', html: site.about?.text ?? '' }),
    ),
  );
}
