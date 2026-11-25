import { makeBody, type Body } from './body';
import { collide, type Manifold } from './collide';

/** Fixed step, 1/120 s. */
export const FIXED_DT = 1 / 120;
/** At most 5 substeps per animation frame. */
export const MAX_SUBSTEPS = 5;
/** Gravity magnitude in px/s^2. */
export const GRAVITY = 2600;
export const LINEAR_DAMPING = 0.02;
export const ANGULAR_DAMPING = 0.6;
export const MAX_SPEED = 4000;
export const FRICTION = 0.55;
export const RESTITUTION_BLOCK = 0.3;
export const RESTITUTION_CHIP = 0.45;
export const SOLVER_ITERATIONS = 10;
export const RESTITUTION_SPEED = 60;
export const WAKE_SPEED = 30;
export const SLEEP_SPEED = 8;
export const SLEEP_ANG = 0.08;
export const SLEEP_TIME = 0.6;
export const CORRECTION_SLOP = 0.5;
export const CORRECTION_PERCENT = 0.35;
const WALL = 200;

interface Pair {
  a: Body;
  b: Body;
  manifold: Manifold;
}

interface WarmPoint {
  x: number;
  y: number;
  jn: number;
  jt: number;
}

function aabbOf(b: Body): { minX: number; minY: number; maxX: number; maxY: number } {
  const c = Math.abs(Math.cos(b.angle));
  const s = Math.abs(Math.sin(b.angle));
  const hw = (b.w * c + b.h * s) / 2;
  const hh = (b.w * s + b.h * c) / 2;
  return { minX: b.x - hw, minY: b.y - hh, maxX: b.x + hw, maxY: b.y + hh };
}

function aabbHit(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function inactive(b: Body): boolean {
  return b.isStatic || b.sleeping;
}

function pairKey(a: Body, b: Body): string {
  return a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
}

function pointVelocity(b: Body, px: number, py: number): { x: number; y: number } {
  const rx = px - b.x;
  const ry = py - b.y;
  return { x: b.vx - b.av * ry, y: b.vy + b.av * rx };
}

export class World {
  bodies: Body[] = [];
  gravity = { x: 0, y: GRAVITY };
  width = 100;
  height = 100;
  /** While true, the runner keeps stepping even if every body is asleep (spawn sequence). */
  holdAwake = false;
  beforeSolve: ((dt: number) => void) | null = null;

  private floor: Body;
  private left: Body;
  private right: Body;
  private warm = new Map<string, { nx: number; ny: number; points: WarmPoint[] }>();

  constructor() {
    this.floor = makeBody({ id: 'floor', w: 400, h: WALL, x: 0, y: 0, isStatic: true, restitution: 0, friction: FRICTION });
    this.left = makeBody({ id: 'wall-l', w: WALL, h: 4000, x: 0, y: 0, isStatic: true, restitution: 0, friction: FRICTION });
    this.right = makeBody({ id: 'wall-r', w: WALL, h: 4000, x: 0, y: 0, isStatic: true, restitution: 0, friction: FRICTION });
    this.bodies.push(this.floor, this.left, this.right);
    this.setBounds(100, 100);
  }

  addBody(body: Body): Body {
    this.bodies.push(body);
    return body;
  }

  removeBody(body: Body): void {
    const i = this.bodies.indexOf(body);
    if (i >= 0) this.bodies.splice(i, 1);
  }

  clearDynamic(): void {
    this.bodies = this.bodies.filter((b) => b.isStatic);
    this.warm.clear();
  }

  wakeAll(): void {
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      b.sleeping = false;
      b.sleepTime = 0;
    }
  }

  allAsleep(): boolean {
    if (this.holdAwake) return false;
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      if (!b.sleeping || b.grabbed) return false;
    }
    return true;
  }

  setBounds(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const wallH = 4000;
    this.floor.w = this.width + 800;
    this.floor.h = WALL;
    this.floor.x = this.width / 2;
    this.floor.y = this.height + WALL / 2;

    this.left.w = WALL;
    this.left.h = wallH;
    this.left.x = -WALL / 2;
    this.left.y = this.height + WALL - wallH / 2;

    this.right.w = WALL;
    this.right.h = wallH;
    this.right.x = this.width + WALL / 2;
    this.right.y = this.left.y;
  }

  step(dt: number): void {
    this.integrateVelocities(dt);
    this.beforeSolve?.(dt);
    const pairs = this.collectPairs();
    this.solve(pairs);
    this.integratePositions(dt);
    this.correctPositions(pairs);
    this.updateSleep(dt);
    this.contain();
  }

  private integrateVelocities(dt: number): void {
    const lin = 1 / (1 + LINEAR_DAMPING * dt);
    const ang = 1 / (1 + ANGULAR_DAMPING * dt);
    for (const b of this.bodies) {
      if (b.isStatic || b.sleeping) continue;
      b.vx += this.gravity.x * dt;
      b.vy += this.gravity.y * dt;
      b.vx *= lin;
      b.vy *= lin;
      b.av *= ang;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_SPEED) {
        const k = MAX_SPEED / sp;
        b.vx *= k;
        b.vy *= k;
      }
    }
  }

  private collectPairs(): Pair[] {
    const pairs: Pair[] = [];
    const list = this.bodies;
    const boxes = list.map(aabbOf);
    const seen = new Set<string>();
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (inactive(a) && inactive(b)) continue;
        if (!aabbHit(boxes[i], boxes[j])) continue;
        const manifold = collide(a, b);
        if (!manifold) continue;
        this.wakeIfHit(a, b, manifold);
        const nx = manifold.normalX;
        const ny = manifold.normalY;
        for (const p of manifold.contacts) {
          const va = pointVelocity(a, p.x, p.y);
          const vb = pointVelocity(b, p.x, p.y);
          const relN = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
          p.e = -relN > RESTITUTION_SPEED ? Math.max(a.restitution, b.restitution) : 0;
        }
        this.warmStart(a, b, manifold);
        pairs.push({ a, b, manifold });
        seen.add(pairKey(a, b));
      }
    }
    for (const key of this.warm.keys()) {
      if (!seen.has(key)) this.warm.delete(key);
    }
    return pairs;
  }

  private warmStart(a: Body, b: Body, manifold: Manifold): void {
    const key = pairKey(a, b);
    const prev = this.warm.get(key);
    if (!prev) return;
    if (prev.nx * manifold.normalX + prev.ny * manifold.normalY < 0.7) return;
    for (const point of manifold.contacts) {
      let best: WarmPoint | null = null;
      let bestD = 36;
      for (const old of prev.points) {
        const d = (old.x - point.x) ** 2 + (old.y - point.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = old;
        }
      }
      if (!best) continue;
      point.jn = best.jn;
      point.jt = best.jt;
      this.applyNormal(a, b, manifold.normalX, manifold.normalY, point.x, point.y, point.jn);
      this.applyTangent(a, b, -manifold.normalY, manifold.normalX, point.x, point.y, point.jt);
    }
  }

  private remember(pairs: Pair[]): void {
    for (const { a, b, manifold } of pairs) {
      this.warm.set(pairKey(a, b), {
        nx: manifold.normalX,
        ny: manifold.normalY,
        points: manifold.contacts.map((p) => ({ x: p.x, y: p.y, jn: p.jn, jt: p.jt })),
      });
    }
  }

  private applyNormal(a: Body, b: Body, nx: number, ny: number, px: number, py: number, jn: number): void {
    if (jn === 0) return;
    const aInv = a.sleeping || a.isStatic ? 0 : a.invMass;
    const bInv = b.sleeping || b.isStatic ? 0 : b.invMass;
    const aInvI = a.sleeping || a.isStatic ? 0 : a.invInertia;
    const bInvI = b.sleeping || b.isStatic ? 0 : b.invInertia;
    const rax = px - a.x;
    const ray = py - a.y;
    const rbx = px - b.x;
    const rby = py - b.y;
    const raN = rax * ny - ray * nx;
    const rbN = rbx * ny - rby * nx;
    a.vx -= nx * jn * aInv;
    a.vy -= ny * jn * aInv;
    a.av -= raN * jn * aInvI;
    b.vx += nx * jn * bInv;
    b.vy += ny * jn * bInv;
    b.av += rbN * jn * bInvI;
  }

  private applyTangent(a: Body, b: Body, tx: number, ty: number, px: number, py: number, jt: number): void {
    if (jt === 0) return;
    const aInv = a.sleeping || a.isStatic ? 0 : a.invMass;
    const bInv = b.sleeping || b.isStatic ? 0 : b.invMass;
    const aInvI = a.sleeping || a.isStatic ? 0 : a.invInertia;
    const bInvI = b.sleeping || b.isStatic ? 0 : b.invInertia;
    const rax = px - a.x;
    const ray = py - a.y;
    const rbx = px - b.x;
    const rby = py - b.y;
    const raT = rax * ty - ray * tx;
    const rbT = rbx * ty - rby * tx;
    a.vx -= tx * jt * aInv;
    a.vy -= ty * jt * aInv;
    a.av -= raT * jt * aInvI;
    b.vx += tx * jt * bInv;
    b.vy += ty * jt * bInv;
    b.av += rbT * jt * bInvI;
  }

  private wakeIfHit(a: Body, b: Body, manifold: Manifold): void {
    const p = manifold.contacts[0];
    if (!p) return;
    const va = pointVelocity(a, p.x, p.y);
    const vb = pointVelocity(b, p.x, p.y);
    const rel = Math.hypot(vb.x - va.x, vb.y - va.y);
    if (rel <= WAKE_SPEED) return;
    if (a.sleeping && !a.isStatic) {
      a.sleeping = false;
      a.sleepTime = 0;
    }
    if (b.sleeping && !b.isStatic) {
      b.sleeping = false;
      b.sleepTime = 0;
    }
  }

  private solve(pairs: Pair[]): void {
    for (let iter = 0; iter < SOLVER_ITERATIONS; iter++) {
      for (const pair of pairs) {
        const { a, b, manifold } = pair;
        const aInv = a.sleeping || a.isStatic ? 0 : a.invMass;
        const bInv = b.sleeping || b.isStatic ? 0 : b.invMass;
        const aInvI = a.sleeping || a.isStatic ? 0 : a.invInertia;
        const bInvI = b.sleeping || b.isStatic ? 0 : b.invInertia;
        if (aInv === 0 && bInv === 0) continue;
        const nx = manifold.normalX;
        const ny = manifold.normalY;
        const tx = -ny;
        const ty = nx;
        const mu = Math.sqrt(a.friction * b.friction);

        for (const p of manifold.contacts) {
          const rax = p.x - a.x;
          const ray = p.y - a.y;
          const rbx = p.x - b.x;
          const rby = p.y - b.y;

          let va = pointVelocity(a, p.x, p.y);
          let vb = pointVelocity(b, p.x, p.y);
          let rvx = vb.x - va.x;
          let rvy = vb.y - va.y;
          const relN = rvx * nx + rvy * ny;
          const raN = rax * ny - ray * nx;
          const rbN = rbx * ny - rby * nx;
          const kN = aInv + bInv + raN * raN * aInvI + rbN * rbN * bInvI;
          if (kN > 1e-8) {
            let jn = (-(1 + p.e) * relN) / kN;
            const old = p.jn;
            p.jn = Math.max(old + jn, 0);
            jn = p.jn - old;
            a.vx -= nx * jn * aInv;
            a.vy -= ny * jn * aInv;
            a.av -= raN * jn * aInvI;
            b.vx += nx * jn * bInv;
            b.vy += ny * jn * bInv;
            b.av += rbN * jn * bInvI;
          }

          va = pointVelocity(a, p.x, p.y);
          vb = pointVelocity(b, p.x, p.y);
          rvx = vb.x - va.x;
          rvy = vb.y - va.y;
          const relT = rvx * tx + rvy * ty;
          const raT = rax * ty - ray * tx;
          const rbT = rbx * ty - rby * tx;
          const kT = aInv + bInv + raT * raT * aInvI + rbT * rbT * bInvI;
          if (kT > 1e-8) {
            let jt = -relT / kT;
            const limit = mu * p.jn;
            const old = p.jt;
            p.jt = Math.max(-limit, Math.min(limit, old + jt));
            jt = p.jt - old;
            a.vx -= tx * jt * aInv;
            a.vy -= ty * jt * aInv;
            a.av -= raT * jt * aInvI;
            b.vx += tx * jt * bInv;
            b.vy += ty * jt * bInv;
            b.av += rbT * jt * bInvI;
          }
        }
      }
    }
    this.remember(pairs);
  }

  private integratePositions(dt: number): void {
    for (const b of this.bodies) {
      if (b.isStatic || b.sleeping) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle += b.av * dt;
    }
  }

  private correctPositions(pairs: Pair[]): void {
    for (const { a, b, manifold } of pairs) {
      const corr = Math.max(manifold.penetration - CORRECTION_SLOP, 0) * CORRECTION_PERCENT;
      if (corr === 0) continue;
      const aInv = a.isStatic || a.sleeping || a.grabbed ? 0 : a.invMass;
      const bInv = b.isStatic || b.sleeping || b.grabbed ? 0 : b.invMass;
      const sum = aInv + bInv;
      if (sum === 0) continue;
      const nx = manifold.normalX;
      const ny = manifold.normalY;
      a.x -= nx * corr * (aInv / sum);
      a.y -= ny * corr * (aInv / sum);
      b.x += nx * corr * (bInv / sum);
      b.y += ny * corr * (bInv / sum);
    }
  }

  private updateSleep(dt: number): void {
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      if (b.grabbed) {
        b.sleeping = false;
        b.sleepTime = 0;
        continue;
      }
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < SLEEP_SPEED && Math.abs(b.av) < SLEEP_ANG) {
        b.sleepTime += dt;
        if (b.sleepTime >= SLEEP_TIME) {
          b.sleeping = true;
          b.vx = 0;
          b.vy = 0;
          b.av = 0;
        }
      } else if (!b.sleeping) {
        b.sleepTime = 0;
      }
    }
  }

  private contain(): void {
    for (const b of this.bodies) {
      if (b.isStatic || b.grabbed) continue;
      const outsideX = b.x < -120 || b.x > this.width + 120;
      const below = b.y > this.height + 120;
      if (!outsideX && !below) continue;
      const minX = b.w / 2;
      const maxX = Math.max(minX, this.width - b.w / 2);
      b.x = Math.max(minX, Math.min(maxX, b.x));
      b.y = this.height - b.h / 2;
      b.vx = 0;
      b.vy = 0;
      b.av = 0;
      b.sleeping = false;
      b.sleepTime = 0;
    }
  }
}
