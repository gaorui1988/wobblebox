import content from '../content';
import { esc } from '../lib/html';
import { iconHtml, icons } from '../lib/icons';

export function heroHtml(): string {
  const tools = [
    { icon: icons.pointer, active: true },
    { icon: icons.square, active: false },
    { icon: icons.circle, active: false },
    { icon: icons.type, active: false },
    { icon: icons.pen, active: false },
  ]
    .map((tool) => `<div class="tool${tool.active ? ' is-active' : ''}">${iconHtml(tool.icon, 18)}</div>`)
    .join('');

  return `<section class="hero">
    <div class="wrap">
      <h1 class="sr-only">${esc(content.h1)}</h1>
      <div class="hero-copy">
        <p class="eyebrow-pill"><i class="mint-dot" aria-hidden="true"></i>${esc(content.eyebrow)}</p>
        <p class="hero-sub">${esc(content.subline)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="./index.html#signup">${esc(content.primaryCta)}${iconHtml(icons.arrowRight, 18)}</a>
          <a class="btn btn-outline" href="./index.html#pricing">${esc(content.secondaryCta)}</a>
        </div>
        <p class="hero-note">${esc(content.heroNote)}</p>
      </div>
      <div id="arena" class="arena dot-grid">
        <div class="arena-bg"></div>
        <div id="arena-bodies" class="arena-bodies"></div>
        <p id="arena-hint" class="arena-hint">${esc(content.hint)}</p>
        <div class="toolbar" aria-hidden="true">${tools}</div>
        <div class="arena-controls">
          <button class="ctrl-btn shake-btn" id="shake-btn" type="button">${iconHtml(icons.sparkles, 16)}Shake</button>
          <button class="ctrl-btn" id="reset-btn" type="button">${iconHtml(icons.reset, 16)}Reset</button>
          <button class="ctrl-btn tilt-btn" id="tilt-btn" type="button">${iconHtml(icons.phone, 16)}Enable tilt</button>
        </div>
      </div>
    </div>
  </section>`;
}
