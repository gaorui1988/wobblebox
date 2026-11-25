import content from '../content';
import { esc } from '../lib/html';

const bulletClass = ['bg-tomato', 'bg-mint', 'bg-sky', 'bg-grape'];

function group(hidden: boolean): string {
  const items = content.marquee
    .map((item, index) => {
      const tone = bulletClass[index % bulletClass.length];
      return `<span class="marquee-item"><span>${esc(item)}</span><i class="marquee-bullet ${tone}" aria-hidden="true"></i></span>`;
    })
    .join('');
  return `<div class="marquee-group"${hidden ? ' aria-hidden="true"' : ''}>${items}</div>`;
}

export function marqueeHtml(): string {
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${group(false)}${group(true)}</div></div>`;
}
