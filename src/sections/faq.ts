import content from '../content';
import { esc } from '../lib/html';
import { iconHtml, icons } from '../lib/icons';

export function faqHtml(): string {
  const items = content.faq
    .map((item, index) => {
      const open = index === 0;
      return `<div class="faq-item${open ? ' is-open' : ''}">
        <h3>
          <button type="button" id="faq-q-${index}" aria-expanded="${open ? 'true' : 'false'}" aria-controls="faq-a-${index}">
            <span>${esc(item.q)}</span>
            <span class="faq-plus">${iconHtml(icons.plus, 16)}</span>
          </button>
        </h3>
        <div class="faq-panel" id="faq-a-${index}" role="region" aria-labelledby="faq-q-${index}">
          <div class="faq-panel-inner"><p>${esc(item.a)}</p></div>
        </div>
      </div>`;
    })
    .join('');

  return `<section class="section bg-paper-deep" id="faq">
    <div class="wrap faq-layout">
      <div>
        <div class="pop">
          <p class="eyebrow">${esc(content.faqIntro.eyebrow)}</p>
          <h2 class="h2">${esc(content.faqIntro.title)}</h2>
        </div>
        <div class="curious">
          <p class="font-display text-xl font-bold text-ink">${esc(content.faqIntro.curious)}</p>
          <p>${esc(content.faqIntro.curiousBody)} <a href="mailto:${esc(content.email)}">${esc(content.email)}</a></p>
        </div>
      </div>
      <div>${items}</div>
    </div>
  </section>`;
}

export function mountFaq(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.faq-item'));
  items.forEach((item) => {
    const button = item.querySelector<HTMLButtonElement>('button');
    if (!button) return;
    button.addEventListener('click', () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      items.forEach((other) => {
        const otherButton = other.querySelector<HTMLButtonElement>('button');
        const open = other === item && willOpen;
        other.classList.toggle('is-open', open);
        otherButton?.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  });
}
