import content, { fills, letterCycle, type FillName } from '../content';
import { iconHtml, icons } from '../lib/icons';
import { reducedMotion } from '../lib/motion';
import { createPiece, destroyPiece, lookupPiece } from '../lib/piece';
import { makeBody, type Body } from '../physics/body';
import { applyDrag, bindDrag } from '../physics/drag';
import { Runner } from '../physics/loop';
import { renderWorld } from '../physics/render';
import { RESTITUTION_BLOCK, RESTITUTION_CHIP, World } from '../physics/world';

type Vignette = (typeof content.features)[number]['vignette'];

interface Spec {
  id: string;
  w: number;
  h: number;
  fill: FillName;
  html: string;
  radius: number;
  restitution: number;
  mono?: boolean;
  fontPx?: number;
  sameX?: boolean;
  stack?: boolean;
}

function specsFor(vignette: Vignette): Spec[] {
  if (vignette.type === 'cursors') {
    return vignette.pieces.map((piece, index) => ({
      id: `cursor-${index}`,
      w: 108,
      h: 40,
      fill: piece.fill,
      html: `${iconHtml(icons.pointer, 16)}<span>${piece.label}</span>`,
      radius: 999,
      restitution: RESTITUTION_CHIP,
      fontPx: 14,
    }));
  }
  if (vignette.type === 'tower') {
    return Array.from({ length: 5 }, (_, index) => ({
      id: `block-${index}`,
      w: 64,
      h: 28,
      fill: letterCycle[index % letterCycle.length],
      html: '',
      radius: 8,
      restitution: RESTITUTION_BLOCK,
      sameX: true,
      stack: true,
    }));
  }
  if (vignette.type === 'comments') {
    return vignette.labels.map((label, index) => ({
      id: `note-${index}`,
      w: Math.max(108, 28 + label.length * 9),
      h: 40,
      fill: 'card' as FillName,
      html: `${iconHtml(icons.message, 16)}<span>${label}</span>`,
      radius: 999,
      restitution: RESTITUTION_CHIP,
      fontPx: 14,
    }));
  }
  if (vignette.type === 'slabs') {
    return vignette.labels.map((label, index) => ({
      id: `slab-${index}`,
      w: 120,
      h: 22,
      fill: 'butter' as FillName,
      html: label,
      radius: 6,
      restitution: RESTITUTION_BLOCK,
      mono: true,
      fontPx: 12,
      sameX: true,
      stack: true,
    }));
  }
  if (vignette.type === 'tags') {
    return vignette.labels.map((label, index) => ({
      id: `tag-${index}`,
      w: Math.max(72, 24 + label.length * 9),
      h: 36,
      fill: 'card' as FillName,
      html: label,
      radius: 10,
      restitution: RESTITUTION_CHIP,
      mono: true,
      fontPx: 13,
    }));
  }
  const iconNodes = {
    'cloud-off': icons.cloudOff,
    'refresh-cw': icons.refresh,
    check: icons.check,
  };
  const iconFills: FillName[] = ['sky', 'grape', 'mint'];
  return vignette.icons.map((name, index) => ({
    id: `icon-${index}`,
    w: 48,
    h: 48,
    fill: iconFills[index % iconFills.length],
    html: iconHtml(iconNodes[name], 22),
    radius: 12,
    restitution: RESTITUTION_CHIP,
  }));
}

export function mountVignettes(): void {
  document.querySelectorAll<HTMLElement>('[data-vignette]').forEach((host) => {
    const index = Number(host.dataset.vignette ?? '0');
    const feature = content.features[index];
    if (!feature) return;
    mountOne(host, specsFor(feature.vignette));
  });
}

function mountOne(host: HTMLElement, specs: Spec[]): void {
  const world = new World();
  world.beforeSolve = () => applyDrag(world);
  let replay = 0;
  let poofing = false;
  let unbind = () => {};
  const pieces: { body: Body; el: HTMLElement }[] = [];

  const disarm = () => {
    if (replay) window.clearTimeout(replay);
    replay = 0;
  };

  const runner = new Runner(world, host, () => {
    renderWorld(world);
    if (reducedMotion || poofing) return;
    if (world.allAsleep()) {
      if (!replay) replay = window.setTimeout(poof, 5000);
    } else {
      disarm();
    }
  });

  const toWorld = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const clear = () => {
    disarm();
    unbind();
    for (const piece of pieces) {
      world.removeBody(piece.body);
      destroyPiece(piece.body, piece.el);
    }
    pieces.length = 0;
    world.clearDynamic();
  };

  const drop = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width < 40 || height < 40) {
      window.requestAnimationFrame(drop);
      return;
    }
    clear();
    world.setBounds(width, height);
    const reduced = reducedMotion;
    world.holdAwake = !reduced;
    unbind = bindDrag(world, host, {
      toWorld,
      lookup: lookupPiece,
      onGrab: () => {
        disarm();
        host.querySelectorAll('.is-poof').forEach((node) => node.classList.remove('is-poof'));
        runner.start();
      },
    });

    specs.forEach((spec, index) => {
      const x = spec.sameX ? width / 2 : 16 + spec.w / 2 + ((index * 47) % Math.max(20, width - spec.w - 20));
      let y = height - spec.h / 2 - (spec.stack ? index * (spec.h + 1) : 0);
      if (!reduced) y = -20 - index * (spec.stack ? spec.h + 8 : 36);
      if (!spec.stack && reduced) {
        const colW = spec.w + 8;
        const cols = Math.max(1, Math.floor((width - 12) / colW));
        const col = index % cols;
        const row = Math.floor(index / cols);
        y = height - spec.h / 2 - row * (spec.h + 6);
        const used = Math.min(specs.length, cols);
        const rowWidth = used * spec.w + (used - 1) * 8;
        const start = (width - rowWidth) / 2;
        const pieceX = start + col * (spec.w + 8) + spec.w / 2;
        spawn(spec, index, pieceX, y, 0, reduced);
        return;
      }
      const angle = reduced ? (spec.stack && spec.id.startsWith('slab') ? (index - 2.5) * 0.04 : 0) : (Math.random() - 0.5) * 0.2;
      const spawnX = spec.sameX ? width / 2 + (reduced ? (index - 2) * 1.5 : 0) : x;
      spawn(spec, index, Math.max(spec.w / 2, Math.min(width - spec.w / 2, spawnX)), y, angle, reduced);
    });

    if (reduced) {
      world.holdAwake = false;
      renderWorld(world);
      return;
    }
    runner.start();
    window.setTimeout(() => {
      world.holdAwake = false;
    }, specs.length * 40 + 80);
  };

  const spawn = (spec: Spec, index: number, x: number, y: number, angle: number, reduced: boolean) => {
    const delay = reduced ? 0 : index * 40;
    const go = () => {
      const body = makeBody({
        id: `${host.dataset.vignette}-${spec.id}`,
        w: spec.w,
        h: spec.h,
        x,
        y,
        angle,
        restitution: spec.restitution,
      });
      if (reduced) body.sleeping = true;
      const el = createPiece(body, spec.html, {
        radius: spec.radius,
        fillClass: fills[spec.fill],
        fontClass: spec.mono ? 'font-mono' : 'font-sans font-semibold',
        fontPx: spec.fontPx,
      });
      world.addBody(body);
      host.append(el);
      pieces.push({ body, el });
      renderWorld(world);
    };
    if (delay === 0) go();
    else window.setTimeout(go, delay);
  };

  const poof = () => {
    replay = 0;
    if (reducedMotion || poofing) return;
    poofing = true;
    pieces.forEach((piece) => piece.el.classList.add('is-poof'));
    window.setTimeout(() => {
      poofing = false;
      drop();
    }, 220);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.3)) {
        observer.disconnect();
        drop();
      }
    },
    { threshold: [0, 0.3] },
  );
  observer.observe(host);
  runner.observe();

  const resize = new ResizeObserver(() => {
    if (host.clientWidth > 0) world.setBounds(host.clientWidth, host.clientHeight);
  });
  resize.observe(host);
}
