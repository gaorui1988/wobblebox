export interface Body {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  av: number;
  invMass: number;
  invInertia: number;
  restitution: number;
  friction: number;
  isStatic: boolean;
  sleeping: boolean;
  sleepTime: number;
  grabbed: boolean;
}

export const DENSITY = 0.001;

export function makeBody(opts: {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  angle?: number;
  restitution?: number;
  friction?: number;
  isStatic?: boolean;
}): Body {
  const isStatic = opts.isStatic === true;
  const mass = opts.w * opts.h * DENSITY;
  const inertia = (mass * (opts.w * opts.w + opts.h * opts.h)) / 12;
  return {
    id: opts.id,
    w: opts.w,
    h: opts.h,
    x: opts.x,
    y: opts.y,
    angle: opts.angle ?? 0,
    vx: 0,
    vy: 0,
    av: 0,
    invMass: isStatic || mass === 0 ? 0 : 1 / mass,
    invInertia: isStatic || inertia === 0 ? 0 : 1 / inertia,
    restitution: opts.restitution ?? 0.3,
    friction: opts.friction ?? 0.55,
    isStatic,
    sleeping: false,
    sleepTime: 0,
    grabbed: false,
  };
}

export function axes(angle: number): { ux: number; uy: number; vx: number; vy: number } {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { ux: c, uy: s, vx: -s, vy: c };
}

/** Rotate a point in body-local space (origin at center) into world space. */
export function localToWorld(body: Body, lx: number, ly: number): { x: number; y: number } {
  const c = Math.cos(body.angle);
  const s = Math.sin(body.angle);
  return { x: body.x + c * lx - s * ly, y: body.y + s * lx + c * ly };
}

export function worldToLocal(body: Body, wx: number, wy: number): { x: number; y: number } {
  const dx = wx - body.x;
  const dy = wy - body.y;
  const c = Math.cos(body.angle);
  const s = Math.sin(body.angle);
  return { x: c * dx + s * dy, y: -s * dx + c * dy };
}
