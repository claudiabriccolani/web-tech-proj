import { getData } from './data.js';

export function applyTheme(themeId) {
  const { themes } = getData().site;
  const theme = themes.find((t) => t.id === themeId) ?? themes[0];

  document.documentElement.dataset.theme = theme.id;

  const link = document.getElementById('theme-css');
  if (link.getAttribute('href') !== theme.href) link.setAttribute('href', theme.href);
}
