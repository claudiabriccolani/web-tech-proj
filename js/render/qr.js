/**
 * render/qr.js — printable sheet with one QR code per location (#/qr).
 * Print styles are in base.css (@media print): header, footer and buttons
 * are hidden and the grid flows over several sheets.
 */
import { el } from '../dom.js';
import { getData, locationUrl } from '../data.js';
import { drawQr } from '../qr.js';
import { pageShell } from './page.js';

export function renderQrSheet(outlet) {
  const { locations } = getData();
  const grid = el('ul', { 'data-role': 'qr-grid' });

  outlet.append(
    pageShell({ page: 'qr', title: 'QR codes' },
      el('p', { 'data-role': 'qr-intro' }, 'One code per location: print this sheet and place each code at its location.'),
      el('button', { type: 'button', 'data-role': 'print-button', onclick: () => window.print() }, 'Print this sheet'),
      grid,
    ),
  );

  for (const loc of locations) {
    const url = locationUrl(loc.identifier);
    const code = el('div', { 'data-role': 'qr-code' });
    grid.append(
      el('li', { 'data-role': 'qr-card', 'data-location': loc.identifier },
        code,
        el('p', { 'data-role': 'qr-label' }, loc.name),
        el('p', { 'data-role': 'qr-url' }, url),
      ),
    );
    drawQr(code, url, 160);
  }
}
