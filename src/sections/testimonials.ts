import content, { fills } from '../content';
import { esc } from '../lib/html';
import { iconHtml, icons } from '../lib/icons';

const quoteColor = {
  tomato: 'text-tomato',
  butter: 'text-butter',
  mint: 'text-mint',
  sky: 'text-sky',
  grape: 'text-grape',
  card: 'text-card',
  ink: 'text-ink',
  paper: 'text-paper',
} as const;

export function testimonialsHtml(): string {
  const stats = content.stats
    .map((stat) => {
      const star = stat.star ? `<span class="text-butter">${iconHtml(icons.star, 18)}</span>` : '';
      return `<p class="stat-chip">${star}${esc(stat.label)}</p>`;
    })
    .join('');
  const cards = content.stories
    .map((story, index) => {
      return `<div class="story-slot pop" style="--rot:${story.rot}deg" data-delay="${index * 70}">
        <article class="story-card">
          <div class="story-band ${fills[story.accent]}"></div>
          <p class="story-mark ${quoteColor[story.accent]}">“</p>
          <blockquote>${esc(story.quote)}</blockquote>
          <div class="story-person">
            <img src="${story.image}" width="64" height="64" alt="${esc(story.alt)}" loading="lazy" />
            <div>
              <strong>${esc(story.name)}</strong>
              <span>${esc(story.role)}</span>
            </div>
          </div>
        </article>
      </div>`;
    })
    .join('');

  return `<section class="section" id="stories">
    <div class="wrap">
      <div class="pop center-head">
        <p class="eyebrow">${esc(content.storiesIntro.eyebrow)}</p>
        <h2 class="h2">${esc(content.storiesIntro.title)}</h2>
      </div>
      <div class="stat-row">${stats}</div>
      <div class="story-grid">${cards}</div>
    </div>
  </section>`;
}
