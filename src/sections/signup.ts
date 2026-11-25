import content from '../content';
import { esc } from '../lib/html';
import { storageGet, storageSet } from '../lib/storage';
import { dropConfetti } from '../signup/confetti';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function signupHtml(): string {
  return `<section class="section" id="signup">
    <div class="wrap">
      <div class="signup-panel">
        <div id="confetti-layer" class="confetti-layer"></div>
        <div class="signup-copy">
          <h2>${esc(content.signup.title)}</h2>
          <p class="sub">${esc(content.signup.sub)}</p>
          <form id="signup-form" class="signup-form" novalidate>
            <label class="sr-only" for="signup-email">Email address</label>
            <input id="signup-email" name="email" type="email" autocomplete="email" placeholder="${esc(content.signup.placeholder)}" aria-label="Email address" />
            <button class="btn btn-primary" type="submit">${esc(content.signup.button)}</button>
          </form>
          <p id="signup-error" class="signup-error" role="alert" hidden>${esc(content.signup.error)}</p>
          <div id="signup-success" class="signup-success" hidden>
            <p>${esc(content.signup.success)}</p>
            <p class="email-pill" id="signup-email-pill"></p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

export function mountSignup(): void {
  const form = document.querySelector<HTMLFormElement>('#signup-form');
  const input = document.querySelector<HTMLInputElement>('#signup-email');
  const error = document.querySelector<HTMLElement>('#signup-error');
  const success = document.querySelector<HTMLElement>('#signup-success');
  const pill = document.querySelector<HTMLElement>('#signup-email-pill');
  const layer = document.querySelector<HTMLElement>('#confetti-layer');
  if (!form || !input || !error || !success || !pill || !layer) return;

  const showSuccess = (email: string, confetti: boolean) => {
    form.hidden = true;
    error.hidden = true;
    success.hidden = false;
    pill.textContent = email;
    if (confetti) dropConfetti(layer);
  };

  const saved = storageGet('signup');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { email?: string };
      if (parsed.email) showSuccess(parsed.email, false);
    } catch {
      /* ignore a bad local value and show the form */
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = input.value.trim();
    if (!emailPattern.test(email)) {
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    storageSet('signup', JSON.stringify({ email, at: new Date().toISOString() }));
    showSuccess(email, true);
  });
}
