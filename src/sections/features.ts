import content, { fills } from '../content';
import { esc } from '../lib/html';

export function featuresHtml(): string {
  const cards = content.features
    .map((feature, index) => {
      const number = String(index + 1).padStart(2, '0');
      const delay = index * 70;
      return `<div class="pop" data-delay="${delay}">
        <article class="feature-card">
          <div class="vignette dot-grid ${feature.tint}" data-vignette="${index}"></div>
          <div class="p-6">
            <span class="index-badge ${fills[feature.accent]}">${number}</span>
            <h3>${esc(feature.title)}</h3>
            <p>${esc(feature.body)}</p>
          </div>
        </article>
      </div>`;
    })
    .join('');

  return `<section class="section bg-paper-deep" id="features">
    <div class="wrap">
      <div class="pop">
        <p class="eyebrow">${esc(content.featuresIntro.eyebrow)}</p>
        <h2 class="h2">${esc(content.featuresIntro.title)}</h2>
        <p class="lede">${esc(content.featuresIntro.lede)}</p>
      </div>
      <div class="feature-grid mt-10">${cards}</div>
    </div>
  </section>`;
}
