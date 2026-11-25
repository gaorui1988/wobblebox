import content from '../content';
import { esc } from '../lib/html';
import { iconHtml, icons } from '../lib/icons';
import { reducedMotion } from '../lib/motion';

export function pricingHtml(): string {
  const cards = content.plans
    .map((plan, index) => {
      const features = plan.features
        .map((feature) => `<li><span class="check-ico">${iconHtml(icons.check, 14)}</span><span>${esc(feature)}</span></li>`)
        .join('');
      const badge = plan.featured ? '<span class="plan-badge">Most picked</span>' : '';
      const studio = plan.featured ? ' plan-studio' : '';
      const wrap = plan.featured ? ' plan-studio-wrap' : '';
      return `<div class="pop${wrap}" data-delay="${index * 70}">
        <article class="plan${studio}">
          ${badge}
          <h3>${esc(plan.name)}</h3>
          <div class="plan-price">
            <span class="price-roll" data-price="${plan.id}"><span class="roll-num">$${plan.monthly}</span></span>
            <span class="plan-suffix">${esc(plan.suffix)}</span>
          </div>
          <p class="plan-note" data-note="${plan.id}">${plan.monthlyNote}</p>
          <p class="plan-desc">${esc(plan.description)}</p>
          <hr class="plan-rule" />
          <ul class="check-list">${features}</ul>
          <a class="btn ${plan.style === 'primary' ? 'btn-primary' : 'btn-outline'}" href="${plan.href}">${esc(plan.cta)}</a>
        </article>
      </div>`;
    })
    .join('');

  return `<section class="section" id="pricing">
    <div class="wrap">
      <div class="pop center-head">
        <p class="eyebrow">${esc(content.pricingIntro.eyebrow)}</p>
        <h2 class="h2">${esc(content.pricingIntro.title)}</h2>
        <p class="lede">${esc(content.pricingIntro.lede)}</p>
      </div>
      <div class="billing-row">
        <div class="billing" data-period="monthly">
          <div class="billing-knob" aria-hidden="true"></div>
          <button type="button" data-bill="monthly" aria-pressed="true">Monthly</button>
          <button type="button" data-bill="yearly" aria-pressed="false">Yearly</button>
        </div>
        <span class="save-badge">save 20%</span>
      </div>
      <div class="pricing-grid mt-10">${cards}</div>
      <p class="pricing-foot">${esc(content.pricingNote)}</p>
    </div>
  </section>`;
}

export function mountPricing(): void {
  const billing = document.querySelector<HTMLElement>('.billing');
  if (!billing) return;
  const buttons = Array.from(billing.querySelectorAll<HTMLButtonElement>('[data-bill]'));

  const render = (period: 'monthly' | 'yearly') => {
    billing.dataset.period = period;
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.bill === period ? 'true' : 'false');
    });
    content.plans.forEach((plan) => {
      const price = document.querySelector<HTMLElement>(`[data-price="${plan.id}"]`);
      const note = document.querySelector<HTMLElement>(`[data-note="${plan.id}"]`);
      const value = period === 'yearly' ? plan.yearly : plan.monthly;
      const label = `$${value}`;
      if (price) setPrice(price, label);
      if (note) note.textContent = period === 'yearly' ? plan.yearlyNote : plan.monthlyNote;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.bill === 'yearly' ? 'yearly' : 'monthly';
      render(next);
    });
  });
}

function setPrice(el: HTMLElement, value: string): void {
  const current = el.querySelector<HTMLElement>('.roll-num');
  if (!current || current.textContent === value) return;
  if (reducedMotion) {
    current.textContent = value;
    return;
  }
  const next = document.createElement('span');
  next.className = 'roll-num roll-in';
  next.textContent = value;
  current.classList.add('roll-out');
  el.append(next);
  window.setTimeout(() => {
    current.remove();
    next.classList.remove('roll-in');
  }, 260);
}
