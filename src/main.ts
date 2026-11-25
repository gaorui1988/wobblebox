import './fonts';
import './style.css';
import { mountArena } from './hero/arena';
import { mountVignettes } from './features/vignettes';
import { mountReveal } from './lib/reveal';
import { faqHtml, mountFaq } from './sections/faq';
import { featuresHtml } from './sections/features';
import { footerHtml } from './sections/footer';
import { headerHtml, mountHeader } from './sections/header';
import { heroHtml } from './sections/hero';
import { marqueeHtml } from './sections/marquee';
import { mountPricing, pricingHtml } from './sections/pricing';
import { mountSignup, signupHtml } from './sections/signup';
import { testimonialsHtml } from './sections/testimonials';

const app = document.querySelector<HTMLElement>('#app');
if (app) {
  app.innerHTML = [
    headerHtml(),
    `<main>${heroHtml()}${marqueeHtml()}${featuresHtml()}${pricingHtml()}${testimonialsHtml()}${signupHtml()}${faqHtml()}</main>`,
    footerHtml(),
  ].join('');
  mountHeader();
  mountReveal();
  mountArena();
  mountVignettes();
  mountPricing();
  mountFaq();
  mountSignup();
}
