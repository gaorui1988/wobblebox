const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export let reducedMotion = query.matches;

const listeners = new Set<(reduced: boolean) => void>();

query.addEventListener('change', () => {
  reducedMotion = query.matches;
  listeners.forEach((listener) => listener(reducedMotion));
});

export function onMotionChange(listener: (reduced: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
