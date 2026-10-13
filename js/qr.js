// qrcodejs draws an <img> without alt text, so alt is set afterwards.
// If the library did not load, the URL is shown as text.
import { el } from './dom.js';

export function drawQr(container, text, size = 128, alt = 'QR code') {
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
  container.querySelector('img')?.setAttribute('alt', alt);
}
