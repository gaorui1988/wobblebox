import { reducedMotion } from './motion';

export function mountReveal(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('.pop'));
  if (reducedMotion) {
    nodes.forEach((node) => node.classList.add('is-done'));
    return;
  }

  const finish = (node: HTMLElement) => {
    node.classList.add('is-done');
    node.classList.remove('is-in');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target as HTMLElement;
        const delay = Number(node.dataset.delay ?? '0');
        node.style.animationDelay = `${delay}ms`;
        node.classList.add('is-in');
        node.addEventListener('animationend', () => finish(node), { once: true });
        observer.unobserve(node);
      });
    },
    { threshold: 0.2 },
  );

  nodes.forEach((node) => observer.observe(node));
}
