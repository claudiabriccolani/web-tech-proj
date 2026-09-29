/**
 * qr.js — draws a QR code with the qrcodejs library (loaded from CDN in
 * index.html, available as window.QRCode).
 *
 * If the library could not be loaded (offline), the URL is shown as text instead.
 */
import { el } from './dom.js';

export function drawQr(container, text, size = 128) {
  if (typeof window.QRCode !== 'function') {
    container.append(el('p', { 'data-role': 'qr-fallback' }, text));
    return;
  }
  // Colours stay black on white on purpose: themes shouldn't reduce scan reliability.
  new window.QRCode(container, {
    text,
    width: size,
    height: size,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: window.QRCode.CorrectLevel.M,
  });
}
