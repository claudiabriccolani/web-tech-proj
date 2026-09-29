/**
 * theme.js — applies a theme.
 *
 * Two things happen:
 *  1. <html data-theme="sixties">: theme CSS rules are scoped with
 *     :root[data-theme="…"], so they only apply to the right theme.
 *  2. The <link id="theme-css"> href is swapped to the theme's stylesheet,
 *     so only one theme file is loaded at a time.
 *
 * The list of themes (id, label, stylesheet) is in data/site.json.
 */
import { getData } from './data.js';

export function applyTheme(themeId) {
  const { themes } = getData().site;
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];

  document.documentElement.dataset.theme = theme.id;

  const link = document.getElementById('theme-css');
  if (link.getAttribute('href') !== theme.href) link.setAttribute('href', theme.href);
}
