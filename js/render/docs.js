/**
 * render/docs.js — documentation page (#/docs, #/docs/3.2).
 *
 * Sections come from site.json "docs" (a tree: each section may have
 * "sections"). Numbers are COMPUTED from the position in the tree, so
 * inserting a section renumbers everything automatically.
 *
 * #/docs/3.2 opens the page scrolled to section 3.2. (Normal #anchors can't be
 * used because the hash is already taken by the router.)
 */
import { el } from '../dom.js';
import { getData } from '../data.js';
import { pageShell } from './page.js';

const sectionId = (number) => `docs-${number.replaceAll('.', '-')}`;

export function renderDocs(outlet, params) {
  const { site } = getData();
  const toc = el('ol', { 'data-role': 'docs-toc' });
  const sections = el('div', { 'data-role': 'docs-sections' });

  addSections(site.docs ?? [], '', 1, toc, sections);

  outlet.append(
    pageShell({ page: 'docs', title: 'Documentation' },
      el('nav', { 'data-role': 'docs-nav', 'aria-label': 'Table of contents' }, el('h2', {}, 'Contents'), toc),
      sections,
    ),
  );

  // Scroll to the requested section (only possible once it is in the document)
  if (params.section) {
    const target = document.getElementById(sectionId(params.section));
    if (target) {
      target.setAttribute('data-target', '');
      target.scrollIntoView({ block: 'start' });
    }
  }
}

/**
 * Recursive: builds the sections of one level, then calls itself for the
 * sub-sections. prefix "3" + position 2 -> number "3.2".
 */
function addSections(list, prefix, depth, tocParent, bodyParent) {
  list.forEach((section, i) => {
    const number = prefix ? `${prefix}.${i + 1}` : String(i + 1);

    // Only h2/h3 are in our HTML vocabulary: deeper levels reuse h3 (data-depth tells them apart)
    const heading = el(depth === 1 ? 'h2' : 'h3', { 'data-role': 'docs-heading' },
      el('span', { 'data-role': 'section-number' }, number), ' ', section.title);

    const sectionEl = el('section',
      { id: sectionId(number), 'data-role': 'docs-section', 'data-section-number': number, 'data-depth': depth },
      heading,
      section.text && el('div', { 'data-role': 'docs-text', html: section.text }),
    );
    bodyParent.append(sectionEl);

    const tocItem = el('li', {}, el('a', { href: `#/docs/${number}` }, `${number} ${section.title}`));
    tocParent.append(tocItem);

    if (section.sections?.length) {
      const subToc = el('ol');
      tocItem.append(subToc);
      addSections(section.sections, number, depth + 1, subToc, sectionEl);
    }
  });
}
