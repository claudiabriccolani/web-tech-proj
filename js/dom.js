/**
 * dom.js — tiny helpers to build DOM nodes without a framework.
 *
 * Instead of writing long strings of HTML, views call:
 *
 *   el('h1', { 'data-role': 'location-title' }, 'Marylebone Station')
 *
 * which creates <h1 data-role="location-title">Marylebone Station</h1>.
 */

/**
 * Create an element.
 * @param {string} tag        element name, e.g. 'section'
 * @param {object} attrs      attributes. Special keys:
 *                            - html: sets innerHTML (only for OUR trusted content from /data)
 *                            - onclick, onchange, ...: add an event listener
 *                            - value true  -> empty attribute (e.g. data-scroll="")
 *                            - value false / null / undefined -> attribute omitted
 * @param {...any} children   strings, nodes, arrays of them; null/false are skipped
 *                            (handy for "condition && el(...)")
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [name, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;

    if (name === 'html') {
      node.innerHTML = value;
    } else if (name.startsWith('on') && typeof value === 'function') {
      node.addEventListener(name.slice(2), value); // 'onclick' -> 'click'
    } else {
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false || child === '') continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

/** Escape text that is inserted into an HTML string (used by the disclaimer template). */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** An external link that opens in a new tab. */
export function externalLink(url, text) {
  return el('a', { href: url, target: '_blank', rel: 'noopener' }, text ?? url);
}
