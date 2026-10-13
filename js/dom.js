// attrs: "html" sets innerHTML (trusted content from /data only), "onclick" and the
// like add a listener, true gives an empty attribute, false and null omit it.
// Falsy children are skipped, so "condition && el(...)" works.
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [name, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;

    if (name === 'html') {
      node.innerHTML = value;
    } else if (name.startsWith('on') && typeof value === 'function') {
      node.addEventListener(name.slice(2), value);
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

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function externalLink(url, text) {
  return el('a', { href: url, target: '_blank', rel: 'noopener' }, text ?? url);
}
