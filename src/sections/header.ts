import content from '../content';
import { esc } from '../lib/html';
import { iconHtml, icons } from '../lib/icons';

export function headerHtml(): string {
  const links = content.nav
    .map((item) => `<a href="${item.href}">${esc(item.label)}</a>`)
    .join('');
  const sheetLinks = content.nav
    .map((item) => `<a class="menu-link" href="${item.href}">${esc(item.label)}</a>`)
    .join('');
  return `<header class="site-header">
    <div class="header-bar wrap">
      <a class="wordmark" href="./index.html">
        <span class="wordmark-mark">${esc(content.brand.slice(0, 1))}</span>
        <span class="wordmark-name">${esc(content.brand)}</span>
      </a>
      <nav class="nav-desktop" aria-label="Primary">${links}</nav>
      <div class="header-actions">
        <a class="login-link" href="${content.login.href}">${esc(content.login.label)}</a>
        <a class="btn btn-primary btn-small start-desktop" href="${content.startFree.href}">${esc(content.startFree.label)}</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">${iconHtml(icons.menu, 22)}</button>
      </div>
    </div>
    <div id="mobile-menu" class="menu-sheet" hidden>
      ${sheetLinks}
      <a class="btn btn-primary" href="${content.startFree.href}">${esc(content.startFree.label)}</a>
    </div>
  </header>`;
}

export function mountHeader(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  const button = document.querySelector<HTMLButtonElement>('.menu-btn');
  const sheet = document.querySelector<HTMLElement>('#mobile-menu');
  if (!header || !button || !sheet) return;

  const paint = (open: boolean) => {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.innerHTML = iconHtml(open ? icons.close : icons.menu, 22);
    sheet.hidden = !open;
    sheet.classList.toggle('is-open', open);
  };

  button.addEventListener('click', () => {
    paint(button.getAttribute('aria-expanded') !== 'true');
  });
  sheet.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a')) paint(false);
  });
  window.addEventListener(
    'scroll',
    () => {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    },
    { passive: true },
  );
}
