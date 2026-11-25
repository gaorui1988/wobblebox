import { localToWorld, worldToLocal, type Body } from './body';
import type { World } from './world';

interface Sample {
  x: number;
  y: number;
  t: number;
}

interface Grab {
  body: Body;
  el: HTMLElement;
  pointerId: number;
  lx: number;
  ly: number;
  samples: Sample[];
}

const grabs = new WeakMap<World, Grab | null>();

function velocityAt(body: Body, rx: number, ry: number): { x: number; y: number } {
  return { x: body.vx - body.av * ry, y: body.vy + body.av * rx };
}

/** Impulse that produces deltaV at a point offset (rx, ry) from the center, times 0.5. */
function grabImpulse(body: Body, rx: number, ry: number, dvx: number, dvy: number): { x: number; y: number } {
  const invM = body.invMass;
  const invI = body.invInertia;
  const a = invM + invI * ry * ry;
  const b = -invI * rx * ry;
  const c = invM + invI * rx * rx;
  const det = a * c - b * b;
  const hx = dvx * 0.5;
  const hy = dvy * 0.5;
  if (det < 1e-8 || invM === 0) return { x: 0, y: 0 };
  return { x: (c * hx - b * hy) / det, y: (-b * hx + a * hy) / det };
}

export function applyDrag(world: World): void {
  const grab = grabs.get(world);
  if (!grab) return;
  const body = grab.body;
  const last = grab.samples[grab.samples.length - 1];
  if (!last) return;
  const grabWorld = localToWorld(body, grab.lx, grab.ly);
  let dvx = (last.x - grabWorld.x) * 25;
  let dvy = (last.y - grabWorld.y) * 25;
  const mag = Math.hypot(dvx, dvy);
  if (mag > 3500) {
    dvx = (dvx / mag) * 3500;
    dvy = (dvy / mag) * 3500;
  }
  const rx = grabWorld.x - body.x;
  const ry = grabWorld.y - body.y;
  const vel = velocityAt(body, rx, ry);
  const impulse = grabImpulse(body, rx, ry, dvx - vel.x, dvy - vel.y);
  body.vx += impulse.x * body.invMass;
  body.vy += impulse.y * body.invMass;
  body.av += (rx * impulse.y - ry * impulse.x) * body.invInertia;
  body.sleeping = false;
  body.sleepTime = 0;
}

export function bindDrag(
  world: World,
  layer: HTMLElement,
  opts: {
    toWorld: (clientX: number, clientY: number) => { x: number; y: number };
    onGrab: (body: Body) => void;
    lookup: (el: HTMLElement) => Body | undefined;
  },
): () => void {
  grabs.set(world, null);

  const end = (e: PointerEvent) => {
    const grab = grabs.get(world);
    if (!grab || grab.pointerId !== e.pointerId) return;
    const now = performance.now();
    const recent = grab.samples.filter((s) => now - s.t <= 100);
    const body = grab.body;
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = Math.max((b.t - a.t) / 1000, 0.001);
      let vx = (b.x - a.x) / dt;
      let vy = (b.y - a.y) / dt;
      const mag = Math.hypot(vx, vy);
      if (mag > 3000) {
        vx = (vx / mag) * 3000;
        vy = (vy / mag) * 3000;
      }
      body.vx = vx;
      body.vy = vy;
    }
    body.grabbed = false;
    body.sleepTime = 0;
    grab.el.classList.remove('is-grabbed');
    grabs.set(world, null);
  };

  const down = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement | null;
    const el = target?.closest('.phys') as HTMLElement | null;
    if (!el || !layer.contains(el)) return;
    const body = opts.lookup(el);
    if (!body || body.isStatic) return;
    const existing = grabs.get(world);
    if (existing) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const p = opts.toWorld(e.clientX, e.clientY);
    const local = worldToLocal(body, p.x, p.y);
    body.grabbed = true;
    body.sleeping = false;
    body.sleepTime = 0;
    el.classList.add('is-grabbed');
    grabs.set(world, {
      body,
      el,
      pointerId: e.pointerId,
      lx: local.x,
      ly: local.y,
      samples: [{ x: p.x, y: p.y, t: performance.now() }],
    });
    opts.onGrab(body);
  };

  const move = (e: PointerEvent) => {
    const grab = grabs.get(world);
    if (!grab || grab.pointerId !== e.pointerId) return;
    const p = opts.toWorld(e.clientX, e.clientY);
    grab.samples.push({ x: p.x, y: p.y, t: performance.now() });
    if (grab.samples.length > 6) grab.samples.shift();
  };

  layer.addEventListener('pointerdown', down);
  layer.addEventListener('pointermove', move);
  layer.addEventListener('pointerup', end);
  layer.addEventListener('pointercancel', end);

  return () => {
    const grab = grabs.get(world);
    if (grab) {
      grab.body.grabbed = false;
      grab.el.classList.remove('is-grabbed');
    }
    grabs.set(world, null);
    layer.removeEventListener('pointerdown', down);
    layer.removeEventListener('pointermove', move);
    layer.removeEventListener('pointerup', end);
    layer.removeEventListener('pointercancel', end);
  };
}
