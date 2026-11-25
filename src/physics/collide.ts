import type { Body } from './body';

export interface ContactPoint {
  x: number;
  y: number;
  jn: number;
  jt: number;
  e: number;
}

export interface Manifold {
  normalX: number;
  normalY: number;
  penetration: number;
  contacts: ContactPoint[];
}

interface Face {
  nx: number;
  ny: number;
  tx: number;
  ty: number;
  halfN: number;
  halfT: number;
}

function facesOf(body: Body): Face[] {
  const c = Math.cos(body.angle);
  const s = Math.sin(body.angle);
  const ux = c;
  const uy = s;
  const vx = -s;
  const vy = c;
  const hw = body.w / 2;
  const hh = body.h / 2;
  return [
    { nx: ux, ny: uy, tx: vx, ty: vy, halfN: hw, halfT: hh },
    { nx: -ux, ny: -uy, tx: vx, ty: vy, halfN: hw, halfT: hh },
    { nx: vx, ny: vy, tx: ux, ty: uy, halfN: hh, halfT: hw },
    { nx: -vx, ny: -vy, tx: ux, ty: uy, halfN: hh, halfT: hw },
  ];
}

function bestFace(body: Body, ox: number, oy: number): Face {
  const faces = facesOf(body);
  let best = faces[0];
  let bestDot = best.nx * ox + best.ny * oy;
  for (let i = 1; i < faces.length; i++) {
    const d = faces[i].nx * ox + faces[i].ny * oy;
    if (d > bestDot) {
      best = faces[i];
      bestDot = d;
    }
  }
  return best;
}

function faceEdge(body: Body, face: Face): [{ x: number; y: number }, { x: number; y: number }] {
  const mx = body.x + face.nx * face.halfN;
  const my = body.y + face.ny * face.halfN;
  return [
    { x: mx + face.tx * face.halfT, y: my + face.ty * face.halfT },
    { x: mx - face.tx * face.halfT, y: my - face.ty * face.halfT },
  ];
}

/** Keep the portion of the segment that is behind the line (dot(p, n) <= offset). */
function clipSegment(
  v1: { x: number; y: number },
  v2: { x: number; y: number },
  nx: number,
  ny: number,
  offset: number,
): { x: number; y: number }[] {
  const d1 = v1.x * nx + v1.y * ny - offset;
  const d2 = v2.x * nx + v2.y * ny - offset;
  const out: { x: number; y: number }[] = [];
  if (d1 <= 0) out.push(v1);
  if (d2 <= 0) out.push(v2);
  if (d1 * d2 < 0) {
    const t = d1 / (d1 - d2);
    out.push({
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t,
    });
  }
  return out;
}

function supportRadius(body: Body, nx: number, ny: number): number {
  const c = Math.cos(body.angle);
  const s = Math.sin(body.angle);
  const ax = Math.abs(nx * c + ny * s);
  const ay = Math.abs(nx * -s + ny * c);
  return (body.w / 2) * ax + (body.h / 2) * ay;
}

/**
 * OBB vs OBB using the separating-axis theorem on the four face normals.
 * The normal points from A to B. One or two contact points come from clipping
 * the incident edge against the reference face.
 */
export function collide(a: Body, b: Body): Manifold | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cA = Math.cos(a.angle);
  const sA = Math.sin(a.angle);
  const cB = Math.cos(b.angle);
  const sB = Math.sin(b.angle);
  const raw = [
    { x: cA, y: sA, owner: 0 as const },
    { x: -sA, y: cA, owner: 0 as const },
    { x: cB, y: sB, owner: 1 as const },
    { x: -sB, y: cB, owner: 1 as const },
  ];

  let bestPen = Infinity;
  let nx = 0;
  let ny = 1;
  let owner: 0 | 1 = 0;

  for (const axis of raw) {
    let ax = axis.x;
    let ay = axis.y;
    if (ax * dx + ay * dy < 0) {
      ax = -ax;
      ay = -ay;
    }
    const dist = ax * dx + ay * dy;
    const pen = supportRadius(a, ax, ay) + supportRadius(b, ax, ay) - dist;
    if (pen <= 0) return null;
    if (pen < bestPen) {
      bestPen = pen;
      nx = ax;
      ny = ay;
      owner = axis.owner;
    }
  }

  const ref = owner === 0 ? a : b;
  const inc = owner === 0 ? b : a;
  const refOx = owner === 0 ? nx : -nx;
  const refOy = owner === 0 ? ny : -ny;
  const refFace = bestFace(ref, refOx, refOy);
  const incFace = bestFace(inc, -refOx, -refOy);
  const [r1, r2] = faceEdge(ref, refFace);
  const [i1, i2] = faceEdge(inc, incFace);

  let clipped = clipSegment(i1, i2, refFace.tx, refFace.ty, r1.x * refFace.tx + r1.y * refFace.ty);
  if (clipped.length >= 2) {
    clipped = clipSegment(
      clipped[0],
      clipped[1],
      -refFace.tx,
      -refFace.ty,
      -(r2.x * refFace.tx + r2.y * refFace.ty),
    );
  }

  const midX = ref.x + refFace.nx * refFace.halfN;
  const midY = ref.y + refFace.ny * refFace.halfN;
  const faceOff = midX * refFace.nx + midY * refFace.ny;
  const contacts: ContactPoint[] = [];
  for (const p of clipped) {
    const sep = p.x * refFace.nx + p.y * refFace.ny - faceOff;
    if (sep <= 1) {
      contacts.push({ x: p.x, y: p.y, jn: 0, jt: 0, e: 0 });
    }
    if (contacts.length === 2) break;
  }

  if (contacts.length === 0) {
    contacts.push({
      x: (a.x + b.x) * 0.5 + nx * bestPen * 0.25,
      y: (a.y + b.y) * 0.5 + ny * bestPen * 0.25,
      jn: 0,
      jt: 0,
      e: 0,
    });
  }

  return { normalX: nx, normalY: ny, penetration: bestPen, contacts };
}
