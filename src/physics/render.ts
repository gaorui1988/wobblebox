import type { Body } from './body';
import type { World } from './world';

interface View {
  root: HTMLElement;
  lastAngle: number;
  lastDist: number;
}

const views = new WeakMap<Body, View>();

export function mountView(body: Body, root: HTMLElement): void {
  views.set(body, { root, lastAngle: Number.NaN, lastDist: -1 });
  syncBody(body);
}

export function unmountView(body: Body): void {
  views.delete(body);
}

export function renderWorld(world: World): void {
  for (const body of world.bodies) syncBody(body);
}

function syncBody(body: Body): void {
  const view = views.get(body);
  if (!view) return;
  const { root } = view;
  root.style.transform = `translate3d(${body.x - body.w / 2}px, ${body.y - body.h / 2}px, 0) rotate(${body.angle}rad)`;
  const dist = body.grabbed ? 10 : 6;
  if (Number.isNaN(view.lastAngle) || Math.abs(body.angle - view.lastAngle) > 0.01 || view.lastDist !== dist) {
    const c = Math.cos(body.angle);
    const s = Math.sin(body.angle);
    const sx = Math.round((dist * c + dist * s) * 2) / 2;
    const sy = Math.round((-dist * s + dist * c) * 2) / 2;
    root.style.boxShadow = `${sx}px ${sy}px 0 #1A1714`;
    view.lastAngle = body.angle;
    view.lastDist = dist;
  }
}
