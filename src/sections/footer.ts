import content from '../content';
import { letterCycle, fills } from '../content';
import { esc } from '../lib/html';

function column(title: string, links: { label: string; href: string; note?: string }[]): string {
  const items = links
    .map((link) => {
      const note = link.note ? `<span class="hiring">${esc(link.note)}</span>` : '';
      return `<a href="${link.href}">${esc(link.label)}</a>${note}`;
    })
    .join('');
  return `<div><h3>${esc(title)}</h3>${items}</div>`;
}

export function footerHtml(): string {
  const letters = content.brand
    .split('')
    .map((char, index) => {
      const rot = index % 2 === 0 ? -4 : 3;
      const fill = fills[letterCycle[index % letterCycle.length]];
      return `<span class="footer-letter ${fill}" style="--rot:${rot}deg">${esc(char)}</span>`;
    })
    .join('');

  return `<footer class="footer">
    <div class="wrap">
      <div class="footer-top">
        <div class="footer-letters" aria-hidden="true">${letters}</div>
        <div class="footer-cols">
          ${column('Product', content.footer.product)}
          ${column('Company', content.footer.company)}
          ${column('Resources', content.footer.resources)}
          <div>
            <h3>Contact</h3>
            <a href="mailto:${esc(content.email)}">${esc(content.email)}</a>
            <p>${esc(content.company)}, ${esc(content.address)}</p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${esc(content.company)}</p>
        <nav aria-label="Legal">
          <a href="./index.html">Privacy</a>
          <a href="./index.html">Terms</a>
          <a href="${content.credit.href}">${esc(content.credit.label)}</a>
        </nav>
      </div>
    </div>
  </footer>`;
}
