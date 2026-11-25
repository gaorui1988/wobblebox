import { type Body } from '../physics/body';
import { mountView, unmountView } from '../physics/render';

const byElement = new WeakMap<HTMLElement, Body>();

export function lookupPiece(el: HTMLElement): Body | undefined {
  const phys = el.closest('.phys');
  if (!(phys instanceof HTMLElement)) return undefined;
  return byElement.get(phys);
}

export function createPiece(
  body: Body,
  innerHTML: string,
  opts: {
    radius: number;
    fillClass: string;
    textClass?: string;
    borderPx?: number;
    fontClass?: string;
    fontPx?: number;
  },
): HTMLElement {
  const root = document.createElement('div');
  root.className = 'phys';
  root.dataset.id = body.id;
  root.style.width = `${body.w}px`;
  root.style.height = `${body.h}px`;

  const inner = document.createElement('div');
  inner.className = `phys-inner ${opts.fillClass} ${opts.textClass ?? 'text-ink'} ${opts.fontClass ?? 'font-sans font-semibold'}`;
  inner.style.borderRadius = opts.radius >= 100 ? '999px' : `${opts.radius}px`;
  inner.style.borderWidth = `${opts.borderPx ?? 3}px`;
  if (opts.fontPx) inner.style.fontSize = `${opts.fontPx}px`;
  inner.innerHTML = innerHTML;
  root.append(inner);

  byElement.set(root, body);
  mountView(body, root);
  return root;
}

export function destroyPiece(body: Body, root: HTMLElement): void {
  unmountView(body);
  byElement.delete(root);
  root.remove();
}
